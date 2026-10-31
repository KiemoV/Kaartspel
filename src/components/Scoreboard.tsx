import { useTranslation } from 'react-i18next'
import type { Player } from '../types/game'
import { formatNumber } from '../utils/format'

interface Props {
  players: Player[]
  valueLabel?: (player: Player) => string
}

export function Scoreboard({ players, valueLabel }: Props) {
  const { t, i18n } = useTranslation()

  const statusLabel = (p: Player) => {
    switch (p.status) {
      case 'out':
        return t('play.statusOut')
      case 'winner':
        return t('play.statusWinner')
      case 'swimming':
        return t('play.statusSwimming')
      default:
        return t('play.statusActive')
    }
  }

  return (
    <div className="scoreboard" aria-label={t('play.scoreboard')}>
      {players.map((p) => (
        <div
          key={p.id}
          className={`score-row ${p.status === 'out' ? 'is-out' : ''} ${p.status === 'winner' ? 'is-winner' : ''}`}
        >
          <span className="name">{p.name}</span>
          <span className="value">
            {valueLabel
              ? valueLabel(p)
              : formatNumber(p.value, i18n.language)}
          </span>
          <span className="status">{statusLabel(p)}</span>
        </div>
      ))}
    </div>
  )
}
