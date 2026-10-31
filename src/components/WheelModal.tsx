import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { resolveSegments } from '../wheel/sets'
import { secureRandomIndex } from '../wheel/spin'
import type { WheelSettings } from '../types/game'

interface Props {
  playerName: string
  settings: WheelSettings
  onDone: (result: string) => void
  onSkip: () => void
}

const SEGMENT_COLORS = ['#0d4a2e', '#c4922a', '#1f6b45', '#e8b84a', '#145c38', '#d4a63c']

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function slicePath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polar(cx, cy, r, endAngle)
  const end = polar(cx, cy, r, startAngle)
  const large = endAngle - startAngle > 180 ? 1 : 0
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ')
}

function shortenLabel(label: string, max = 14): string {
  const trimmed = label.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

export function WheelModal({ playerName, settings, onDone, onSkip }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith('nl') ? 'nl' : 'en'
  const segments = useMemo(
    () => resolveSegments(settings.setId, settings.customSegments, lang),
    [settings, lang],
  )
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<string | null>(null)
  const [spinning, setSpinning] = useState(false)

  const slice = segments.length > 0 ? 360 / segments.length : 360

  const handleSpin = () => {
    if (spinning || segments.length === 0) return
    setSpinning(true)
    setResult(null)

    const index = secureRandomIndex(segments.length)
    const picked = segments[index]!
    // Midpoint of segment index, measured clockwise from top.
    const midAngle = index * slice + slice / 2
    // Rotate so that midpoint lands under the top pointer.
    const mod = ((rotation % 360) + 360) % 360
    const desired = (360 - midAngle + 360) % 360
    const delta = (desired - mod + 360) % 360
    const target = rotation + 5 * 360 + delta

    setRotation(target)
    window.setTimeout(() => {
      setResult(picked)
      setSpinning(false)
    }, 3400)
  }

  const size = 320
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 4

  return (
    <div className="wheel-overlay" role="dialog" aria-modal="true">
      <div className="wheel-panel">
        <header className="wheel-header">
          <h2>{t('wheel.title')}</h2>
          <p>{t('wheel.forPlayer', { name: playerName || '—' })}</p>
        </header>

        <div className="wheel-stage">
          <div className="wheel-pointer" aria-hidden />
          <div className="wheel-disc-wrap">
            <svg
              className="wheel-svg"
              viewBox={`0 0 ${size} ${size}`}
              style={{ transform: `rotate(${rotation}deg)` }}
              role="img"
              aria-label={t('wheel.title')}
            >
              {segments.map((label, index) => {
                const start = index * slice
                const end = start + slice
                const mid = start + slice / 2
                const labelPos = polar(cx, cy, radius * 0.62, mid)
                const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length]!
                return (
                  <g key={`${label}-${index}`}>
                    <path
                      d={slicePath(cx, cy, radius, start, end)}
                      fill={color}
                      stroke="#0a2f1e"
                      strokeWidth="1.5"
                    />
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      fill={index % 2 === 0 ? '#f7f3e8' : '#1a1204'}
                      fontSize={segments.length > 8 ? 11 : 13}
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${mid}, ${labelPos.x}, ${labelPos.y})`}
                    >
                      {shortenLabel(label, segments.length > 8 ? 10 : 14)}
                    </text>
                  </g>
                )
              })}
              <circle cx={cx} cy={cy} r="18" fill="#0a2f1e" />
              <circle cx={cx} cy={cy} r="10" fill="var(--gold, #e8b84a)" />
            </svg>
          </div>
        </div>

        {segments.length === 0 && (
          <p className="hint">{t('wheel.empty')}</p>
        )}

        <div className="wheel-result" aria-live="polite">
          {result ? (
            <>
              <div className="wheel-result-label">{t('wheel.result')}</div>
              <div className="wheel-result-value">{result}</div>
            </>
          ) : (
            <div className="wheel-result-value is-muted">
              {spinning ? t('wheel.spinning') : t('wheel.spinHint')}
            </div>
          )}
        </div>

        <div className="wheel-actions">
          {!result ? (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSpin}
                disabled={spinning || segments.length === 0}
              >
                {t('wheel.spin')}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onSkip}
                disabled={spinning}
              >
                {t('wheel.skip')}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => onDone(result)}
            >
              {t('wheel.continue')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
