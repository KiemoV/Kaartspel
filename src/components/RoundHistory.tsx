import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { distanceTo31 } from '../games/eenendertigen'
import { toepenRoundPenalties } from '../games/toepen'
import type {
  EenendertigenRoundInput,
  Game,
  HartenjagenRoundInput,
  Player,
  Round,
  ToepenRoundInput,
} from '../types/game'
import { formatNumber } from '../utils/format'

interface Props {
  game: Game
  onCorrect: (roundId: string) => void
  correctingId: string | null
}

function playerName(players: Player[], id: string): string {
  return players.find((p) => p.id === id)?.name ?? id
}

function summarizeRound(
  game: Game,
  round: Round,
  lang: string,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string[] {
  const lines: string[] = []
  const players = game.players

  if (game.type === 'toepen') {
    const input = round.input as ToepenRoundInput
    lines.push(t('history.finalStake', { n: input.finalStake }))
    for (const fold of input.folds) {
      lines.push(
        t('history.foldLine', {
          name: playerName(players, fold.playerId),
          n: fold.stake,
        }),
      )
    }
    for (const id of input.loserIds) {
      lines.push(
        t('history.lostLine', {
          name: playerName(players, id),
          n: input.finalStake,
        }),
      )
    }
    for (const swap of input.swaps) {
      const lookers = swap.lookerIds
        .map((id) => playerName(players, id))
        .join(', ')
      if (swap.lookerIds.length === 0) {
        lines.push(
          t('history.swapNoLook', {
            name: playerName(players, swap.requesterId),
          }),
        )
      } else if (swap.justified) {
        lines.push(
          t('history.swapJustified', {
            name: playerName(players, swap.requesterId),
            lookers,
          }),
        )
      } else {
        lines.push(
          t('history.swapUnjustified', {
            name: playerName(players, swap.requesterId),
            lookers,
          }),
        )
      }
    }
    const penalties = toepenRoundPenalties(input)
    const scored = Object.entries(penalties)
      .filter(([, n]) => n > 0)
      .map(
        ([id, n]) =>
          `${playerName(players, id)} +${formatNumber(n, lang)}`,
      )
    if (scored.length > 0) {
      lines.push(t('history.totalLine', { detail: scored.join(' · ') }))
    }
  } else if (game.type === 'hartenjagen') {
    const input = round.input as HartenjagenRoundInput
    for (const [id, score] of Object.entries(input.scores)) {
      lines.push(
        `${playerName(players, id)}: ${formatNumber(score, lang)}`,
      )
    }
  } else {
    const input = round.input as EenendertigenRoundInput
    for (const [id, hand] of Object.entries(input.hands)) {
      lines.push(
        t('history.handLine', {
          name: playerName(players, id),
          hand: formatNumber(hand, lang),
          dist: formatNumber(distanceTo31(hand), lang),
        }),
      )
    }
    if (input.chosenLoserId) {
      lines.push(
        t('history.chosenLoser', {
          name: playerName(players, input.chosenLoserId),
        }),
      )
    }
  }

  if (round.wheelOutcomes) {
    for (const [id, label] of Object.entries(round.wheelOutcomes)) {
      lines.push(
        t('history.wheelLine', {
          name: playerName(players, id),
          label,
        }),
      )
    }
  }

  return lines
}

export function RoundHistory({ game, onCorrect, correctingId }: Props) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(true)

  if (game.rounds.length === 0) return null

  return (
    <section className="panel">
      <button
        type="button"
        className="history-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <h2>{t('history.title')}</h2>
        <span className="history-toggle-meta">
          {t('history.count', { n: game.rounds.length })}
          <span aria-hidden>{open ? ' ▾' : ' ▸'}</span>
        </span>
      </button>

      {open && (
        <div className="history-list">
          {[...game.rounds].reverse().map((round, reverseIndex) => {
            const roundNumber = game.rounds.length - reverseIndex
            const lines = summarizeRound(game, round, i18n.language, t)
            const isCorrecting = correctingId === round.id
            return (
              <article
                key={round.id}
                className={`history-item ${isCorrecting ? 'is-correcting' : ''}`}
              >
                <div className="history-item-head">
                  <strong>{t('play.round', { n: roundNumber })}</strong>
                  <button
                    type="button"
                    className="btn"
                    disabled={Boolean(correctingId) && !isCorrecting}
                    onClick={() => onCorrect(round.id)}
                  >
                    {isCorrecting
                      ? t('history.correcting')
                      : t('play.correct')}
                  </button>
                </div>
                <ul className="history-lines">
                  {lines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
