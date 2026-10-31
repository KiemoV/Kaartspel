import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { resolveSegments } from '../wheel/sets'
import { spinWheel } from '../wheel/spin'
import type { WheelSettings } from '../types/game'

interface Props {
  playerName: string
  settings: WheelSettings
  onDone: (result: string) => void
  onSkip: () => void
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

  const handleSpin = () => {
    if (spinning || segments.length === 0) return
    setSpinning(true)
    setResult(null)
    const picked = spinWheel(segments)
    const index = segments.indexOf(picked)
    const slice = 360 / segments.length
    const extra = 5 * 360
    const target = extra + (360 - index * slice - slice / 2)
    setRotation((r) => r + target)
    window.setTimeout(() => {
      setResult(picked)
      setSpinning(false)
    }, 3200)
  }

  return (
    <div className="wheel-overlay" role="dialog" aria-modal="true">
      <div className="wheel-panel">
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)' }}>
          {t('wheel.title')}
        </h2>
        <p style={{ margin: 0 }}>{t('wheel.forPlayer', { name: playerName })}</p>
        <div className="wheel-pointer" aria-hidden />
        <div
          className="wheel-disc"
          style={{ transform: `rotate(${rotation}deg)` }}
        />
        <div className="wheel-result">
          {result ? (
            <>
              <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                {t('wheel.result')}
              </div>
              {result}
            </>
          ) : (
            '\u00a0'
          )}
        </div>
        <div className="row" style={{ width: '100%' }}>
          {!result ? (
            <>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleSpin}
                disabled={spinning || segments.length === 0}
              >
                {t('wheel.spin')}
              </button>
              <button type="button" className="btn btn-ghost" onClick={onSkip}>
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
