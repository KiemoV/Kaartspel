import { useTranslation } from 'react-i18next'
import { Scoreboard } from '../components/Scoreboard'
import type { Game } from '../types/game'
import { formatNumber } from '../utils/format'

interface Props {
  game: Game
  onPlayAgain: () => void
  onNewGame: () => void
}

export function WinnerScreen({ game, onPlayAgain, onNewGame }: Props) {
  const { t, i18n } = useTranslation()
  const winner = game.players.find((p) => p.id === game.winnerId)

  return (
    <>
      <div className="winner-banner">
        <h1>{t('winner.title')}</h1>
        <p>{t('winner.congrats', { name: winner?.name ?? '—' })}</p>
      </div>

      <section className="panel">
        <h2>{t('play.scoreboard')}</h2>
        <Scoreboard
          players={game.players}
          valueLabel={(p) => formatNumber(p.value, i18n.language)}
        />
      </section>

      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={onPlayAgain}
      >
        {t('winner.playAgain')}
      </button>
      <button type="button" className="btn btn-block" onClick={onNewGame}>
        {t('winner.newGame')}
      </button>
    </>
  )
}
