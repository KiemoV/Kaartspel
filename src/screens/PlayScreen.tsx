import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  HistoryClockButton,
  RoundHistory,
} from '../components/RoundHistory'
import { Scoreboard } from '../components/Scoreboard'
import { ToepenRoundForm } from '../components/ToepenRoundForm'
import { WheelModal } from '../components/WheelModal'
import {
  applyRound,
  correctRound,
  lastRoundLoserIds,
  newlyEliminatedIds,
  undoLastRound,
} from '../games/engine'
import { distanceTo31 } from '../games/eenendertigen'
import type {
  EenendertigenRoundInput,
  Game,
  HartenjagenRoundInput,
  ToepenRoundInput,
} from '../types/game'
import { formatNumber, parseLocaleNumber } from '../utils/format'

interface Props {
  game: Game
  onChange: (game: Game) => void
  onFinished: () => void
  onHome: () => void
}

type WheelQueueItem = { playerId: string; playerName: string }

function activePlayers(game: Game) {
  return game.players.filter(
    (p) => p.status === 'active' || p.status === 'swimming',
  )
}

export function PlayScreen({ game, onChange, onFinished, onHome }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const [hjScores, setHjScores] = useState<Record<string, string>>({})
  const [hands, setHands] = useState<Record<string, string>>({})
  const [chosenLoserId, setChosenLoserId] = useState<string | undefined>()
  const [correctingId, setCorrectingId] = useState<string | null>(null)
  const [wheelQueue, setWheelQueue] = useState<WheelQueueItem[]>([])
  const [pendingOutcomes, setPendingOutcomes] = useState<Record<string, string>>(
    {},
  )
  /** Bump to remount Toepen form after submit/cancel. */
  const [toepenFormKey, setToepenFormKey] = useState(0)
  const [historyOpen, setHistoryOpen] = useState(false)

  const wheelSettings = game.settings.wheel

  const resetInputs = () => {
    setChosenLoserId(undefined)
    setHjScores({})
    setHands({})
    setToepenFormKey((k) => k + 1)
  }

  const buildWheelQueue = (next: Game, previous: Game): WheelQueueItem[] => {
    if (!wheelSettings.enabled) return []
    if (next.rounds.length === previous.rounds.length) return []

    let ids: string[] = []
    if (wheelSettings.trigger === 'every_round') {
      ids = lastRoundLoserIds(next)
    } else if (wheelSettings.trigger === 'on_elimination') {
      ids = newlyEliminatedIds(next)
    } else if (wheelSettings.trigger === 'at_end' && next.status === 'finished') {
      if (
        next.type === 'eenendertigen' &&
        next.settings.type === 'eenendertigen' &&
        next.settings.eenendertigen.mode === 'points'
      ) {
        const sorted = [...next.players].sort((a, b) => b.value - a.value)
        ids = sorted[0] ? [sorted[0].id] : []
      } else {
        ids = lastRoundLoserIds(next)
      }
    }

    return ids
      .map((id) => {
        const p = next.players.find((x) => x.id === id)
        return p ? { playerId: id, playerName: p.name } : null
      })
      .filter(Boolean) as WheelQueueItem[]
  }

  const maybeFinish = (next: Game, queueLen: number) => {
    if (next.status === 'finished' && queueLen === 0) {
      onFinished()
    }
  }

  const commitRound = (
    input: ToepenRoundInput | HartenjagenRoundInput | EenendertigenRoundInput,
  ) => {
    if (correctingId) {
      const next = correctRound(game, correctingId, input)
      onChange(next)
      setCorrectingId(null)
      resetInputs()
      maybeFinish(next, 0)
      return
    }
    const next = applyRound(game, input)
    const queue = buildWheelQueue(next, game)
    onChange(next)
    resetInputs()
    if (queue.length > 0) {
      setPendingOutcomes({})
      setWheelQueue(queue)
    } else {
      maybeFinish(next, 0)
    }
  }

  const finishWheel = (outcomes: Record<string, string>) => {
    const rounds = game.rounds.map((r, i) =>
      i === game.rounds.length - 1
        ? {
            ...r,
            wheelOutcomes:
              Object.keys(outcomes).length > 0 ? outcomes : r.wheelOutcomes,
          }
        : r,
    )
    const next = { ...game, rounds }
    onChange(next)
    setPendingOutcomes({})
    setWheelQueue([])
    maybeFinish(next, 0)
  }

  const onWheelDone = (result: string) => {
    const current = wheelQueue[0]
    if (!current) return
    const outcomes = { ...pendingOutcomes, [current.playerId]: result }
    const rest = wheelQueue.slice(1)
    if (rest.length === 0) {
      finishWheel(outcomes)
    } else {
      setPendingOutcomes(outcomes)
      setWheelQueue(rest)
    }
  }

  const onWheelSkip = () => {
    const rest = wheelQueue.slice(1)
    if (rest.length === 0) {
      finishWheel(pendingOutcomes)
    } else {
      setWheelQueue(rest)
    }
  }

  const beginCorrect = (roundId: string) => {
    const round = game.rounds.find((r) => r.id === roundId)
    if (!round) return
    setCorrectingId(roundId)
    setToepenFormKey((k) => k + 1)
    if (game.type === 'hartenjagen') {
      const input = round.input as HartenjagenRoundInput
      const mapped: Record<string, string> = {}
      for (const [id, v] of Object.entries(input.scores)) {
        mapped[id] = formatNumber(v, lang)
      }
      setHjScores(mapped)
    } else if (game.type === 'eenendertigen') {
      const input = round.input as EenendertigenRoundInput
      const mapped: Record<string, string> = {}
      for (const [id, v] of Object.entries(input.hands)) {
        mapped[id] = formatNumber(v, lang)
      }
      setHands(mapped)
      setChosenLoserId(input.chosenLoserId)
    }
  }

  const tiedLowest = useMemo(() => {
    if (game.type !== 'eenendertigen') return []
    if (game.settings.type !== 'eenendertigen') return []
    if (game.settings.eenendertigen.lowestTie !== 'choose_one') return []
    const alive = activePlayers(game)
    const parsed = alive
      .map((p) => ({ id: p.id, hand: parseLocaleNumber(hands[p.id] ?? '') }))
      .filter((x): x is { id: string; hand: number } => x.hand !== null)
    if (parsed.length < 2) return []
    const min = Math.min(...parsed.map((p) => p.hand))
    const lows = parsed.filter((p) => p.hand === min)
    return lows.length > 1 ? lows.map((l) => l.id) : []
  }, [game, hands])

  const submitHartenjagen = () => {
    const alive = activePlayers(game)
    const scores: Record<string, number> = {}
    for (const p of alive) {
      const n = parseLocaleNumber(hjScores[p.id] ?? '')
      if (n === null) return
      scores[p.id] = n
    }
    commitRound({ scores })
  }

  const submitEenendertigen = () => {
    const alive = activePlayers(game)
    const parsedHands: Record<string, number> = {}
    for (const p of alive) {
      const n = parseLocaleNumber(hands[p.id] ?? '')
      if (n === null) return
      if (n < 0 || n > 31) return
      if (Math.round(n * 2) !== n * 2) return
      parsedHands[p.id] = n
    }
    if (
      game.settings.type === 'eenendertigen' &&
      game.settings.eenendertigen.lowestTie === 'choose_one' &&
      tiedLowest.length > 1 &&
      !chosenLoserId
    ) {
      return
    }
    const input: EenendertigenRoundInput = { hands: parsedHands }
    if (chosenLoserId) input.chosenLoserId = chosenLoserId
    commitRound(input)
  }

  const valueLabel = (p: (typeof game.players)[0]) => {
    if (
      game.type === 'eenendertigen' &&
      game.settings.type === 'eenendertigen' &&
      game.settings.eenendertigen.mode === 'lives'
    ) {
      if (p.status === 'swimming') return t('eenendertigen.swimmingStatus')
      return t('eenendertigen.livesLeft', { n: formatNumber(p.value, lang) })
    }
    return formatNumber(p.value, lang)
  }

  const gameTitle =
    game.type === 'toepen'
      ? t('home.toepen')
      : game.type === 'hartenjagen'
        ? t('home.hartenjagen')
        : t('home.eenendertigen')

  const correctingToepen =
    correctingId && game.type === 'toepen'
      ? (game.rounds.find((r) => r.id === correctingId)?.input as
          | ToepenRoundInput
          | undefined)
      : undefined

  const toepenFormPlayers = (() => {
    const active = activePlayers(game)
    if (!correctingToepen) return active
    const ids = new Set([
      ...active.map((p) => p.id),
      ...correctingToepen.folds.map((f) => f.playerId),
      ...correctingToepen.loserIds,
      ...correctingToepen.swaps.flatMap((s) => [
        s.requesterId,
        ...s.lookerIds,
      ]),
    ])
    return game.players.filter((p) => ids.has(p.id))
  })()

  return (
    <>
      <div className="topbar">
        <button
          type="button"
          className="chip-btn"
          onClick={() => {
            if (window.confirm(t('play.leaveWarning'))) onHome()
          }}
        >
          {t('nav.home')}
        </button>
        <button
          type="button"
          className="chip-btn"
          onClick={() =>
            void i18n.changeLanguage(i18n.language.startsWith('nl') ? 'en' : 'nl')
          }
        >
          {i18n.language.startsWith('nl') ? 'NL → EN' : 'EN → NL'}
        </button>
      </div>

      <h1 className="screen-title">{gameTitle}</h1>
      <div className="round-line">
        <p className="muted-on-felt">
          {t('play.round', { n: game.rounds.length + (correctingId ? 0 : 1) })}
          {game.type === 'hartenjagen' && game.phase
            ? ` · ${t('hartenjagen.phase', { n: game.phase })}`
            : ''}
          {correctingId ? ` · ${t('play.correctTitle')}` : ''}
        </p>
        <HistoryClockButton
          disabled={game.rounds.length === 0}
          open={historyOpen}
          label={t('history.title')}
          onClick={() => setHistoryOpen((v) => !v)}
        />
      </div>

      <RoundHistory
        game={game}
        open={historyOpen}
        correctingId={correctingId}
        onCorrect={(roundId) => {
          beginCorrect(roundId)
          setHistoryOpen(true)
        }}
      />

      <section className="panel">
        <h2>{t('play.scoreboard')}</h2>
        <Scoreboard players={game.players} valueLabel={valueLabel} />
        <div className="toolbar">
          <button
            type="button"
            className="btn"
            disabled={game.rounds.length === 0 || Boolean(correctingId)}
            onClick={() => {
              const next = undoLastRound(game)
              onChange(next)
              resetInputs()
            }}
          >
            {t('play.undo')}
          </button>
          {game.rounds.length > 0 && !correctingId && (
            <button
              type="button"
              className="btn"
              onClick={() =>
                beginCorrect(game.rounds[game.rounds.length - 1]!.id)
              }
            >
              {t('play.correct')}
            </button>
          )}
          {correctingId && game.type !== 'toepen' && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setCorrectingId(null)
                resetInputs()
              }}
            >
              {t('play.cancel')}
            </button>
          )}
        </div>
      </section>

      {game.status === 'playing' &&
        game.type === 'toepen' &&
        game.settings.type === 'toepen' && (
          <ToepenRoundForm
            key={`${toepenFormKey}-${correctingId ?? 'new'}`}
            players={toepenFormPlayers}
            settings={game.settings.toepen}
            initial={correctingToepen}
            correcting={Boolean(correctingId)}
            onSubmit={commitRound}
            onCancel={() => {
              setCorrectingId(null)
              resetInputs()
            }}
          />
        )}

      {game.status === 'playing' && game.type === 'hartenjagen' && (
        <section className="panel">
          <h2>{t('hartenjagen.scores')}</h2>
          {activePlayers(game).map((p) => (
            <div className="field" key={p.id}>
              <label htmlFor={`hj-${p.id}`}>
                {p.name}
                {p.inPhase2 ? ` · ${t('hartenjagen.phase', { n: 2 })}` : ''}
              </label>
              <input
                id={`hj-${p.id}`}
                inputMode="decimal"
                value={hjScores[p.id] ?? ''}
                onChange={(e) =>
                  setHjScores((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
              />
            </div>
          ))}
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={submitHartenjagen}
          >
            {correctingId
              ? t('play.saveCorrection')
              : t('hartenjagen.confirmRound')}
          </button>
        </section>
      )}

      {game.status === 'playing' && game.type === 'eenendertigen' && (
        <section className="panel">
          <h2>{t('eenendertigen.handScore')}</h2>
          {activePlayers(game).map((p) => {
            const parsed = parseLocaleNumber(hands[p.id] ?? '')
            return (
              <div className="field" key={p.id}>
                <label htmlFor={`hand-${p.id}`}>{p.name}</label>
                <input
                  id={`hand-${p.id}`}
                  inputMode="decimal"
                  value={hands[p.id] ?? ''}
                  onChange={(e) =>
                    setHands((prev) => ({ ...prev, [p.id]: e.target.value }))
                  }
                />
                <div className="row">
                  <div className="quick-btns" style={{ flex: 1 }}>
                    <button
                      type="button"
                      className="btn"
                      onClick={() =>
                        setHands((prev) => ({
                          ...prev,
                          [p.id]: lang.startsWith('nl') ? '30,5' : '30.5',
                        }))
                      }
                    >
                      {t('eenendertigen.quick305')}
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() =>
                        setHands((prev) => ({ ...prev, [p.id]: '31' }))
                      }
                    >
                      {t('eenendertigen.quick31')}
                    </button>
                  </div>
                </div>
                {parsed !== null && (
                  <span className="distance">
                    {t('eenendertigen.distance')}:{' '}
                    {formatNumber(distanceTo31(parsed), lang)}
                  </span>
                )}
              </div>
            )
          })}

          {tiedLowest.length > 1 && (
            <div className="field">
              <label>{t('eenendertigen.chooseLoser')}</label>
              <div className="choice-list">
                {tiedLowest.map((id) => {
                  const p = game.players.find((x) => x.id === id)
                  return (
                    <button
                      type="button"
                      key={id}
                      className={chosenLoserId === id ? 'is-on' : ''}
                      onClick={() => setChosenLoserId(id)}
                    >
                      {p?.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={submitEenendertigen}
          >
            {correctingId
              ? t('play.saveCorrection')
              : t('eenendertigen.confirmRound')}
          </button>
          <p className="hint">{t('eenendertigen.fillAll')}</p>
        </section>
      )}

      {game.rounds.length > 0 &&
        game.rounds[game.rounds.length - 1]?.wheelOutcomes && (
          <section className="panel">
            <h2>{t('wheel.result')}</h2>
            {Object.entries(
              game.rounds[game.rounds.length - 1]!.wheelOutcomes!,
            ).map(([pid, label]) => {
              const p = game.players.find((x) => x.id === pid)
              return (
                <p key={pid} style={{ margin: 0 }}>
                  <strong>{p?.name}</strong>: {label}
                </p>
              )
            })}
          </section>
        )}

      {wheelQueue[0] && wheelSettings.enabled && (
        <WheelModal
          playerName={wheelQueue[0].playerName}
          settings={wheelSettings}
          onDone={onWheelDone}
          onSkip={onWheelSkip}
        />
      )}
    </>
  )
}
