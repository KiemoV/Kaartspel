import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { countToepenWinners, toepenRoundPenalties } from '../games/toepen'
import type {
  Player,
  ToepenRoundInput,
  ToepenSettings,
  ToepenSwap,
} from '../types/game'

type Outcome = 'unset' | 'none' | 'fold' | 'lost'

interface PlayerSwapState {
  enabled: boolean
  lookerIds: string[]
  justified: boolean
}

interface Props {
  players: Player[]
  settings: ToepenSettings
  initial?: ToepenRoundInput
  correcting: boolean
  onSubmit: (input: ToepenRoundInput) => void
  onCancel?: () => void
}

function initialSwaps(
  players: Player[],
  initial?: ToepenRoundInput,
): Record<string, PlayerSwapState> {
  const map: Record<string, PlayerSwapState> = {}
  for (const p of players) {
    const existing = initial?.swaps.find((s) => s.requesterId === p.id)
    map[p.id] = existing
      ? {
          enabled: true,
          lookerIds: [...existing.lookerIds],
          justified: existing.justified,
        }
      : { enabled: false, lookerIds: [], justified: false }
  }
  return map
}

export function ToepenRoundForm({
  players,
  settings,
  initial,
  correcting,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useTranslation()
  const startStake = settings.startStake

  const [finalStake, setFinalStake] = useState(
    initial?.finalStake ?? startStake,
  )
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>(() => {
    const map: Record<string, Outcome> = {}
    if (!initial) {
      for (const p of players) map[p.id] = 'unset'
      return map
    }
    for (const p of players) {
      if (initial.loserIds.includes(p.id)) map[p.id] = 'lost'
      else if (initial.folds.some((f) => f.playerId === p.id)) map[p.id] = 'fold'
      else map[p.id] = 'none'
    }
    // Enforce single winner when loading older/invalid data
    let seenWinner = false
    for (const p of players) {
      if (map[p.id] !== 'none') continue
      if (!seenWinner) {
        seenWinner = true
      } else {
        map[p.id] = 'lost'
      }
    }
    return map
  })
  const [foldStakes, setFoldStakes] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    for (const p of players) {
      const fold = initial?.folds.find((f) => f.playerId === p.id)
      map[p.id] = fold?.stake ?? startStake
    }
    return map
  })
  const [swaps, setSwaps] = useState<Record<string, PlayerSwapState>>(() =>
    initialSwaps(players, initial),
  )

  const setOutcome = (id: string, outcome: Outcome) => {
    setOutcomes((prev) => {
      const next: Record<string, Outcome> = { ...prev, [id]: outcome }
      if (outcome === 'none') {
        for (const pid of Object.keys(next)) {
          if (pid !== id && next[pid] === 'none') next[pid] = 'lost'
        }
      }
      return next
    })
    if (outcome === 'fold') {
      setFoldStakes((prev) => ({
        ...prev,
        [id]: prev[id] ?? Math.max(startStake, finalStake - 1),
      }))
    }
  }

  const setSwapEnabled = (id: string, enabled: boolean) => {
    setSwaps((prev) => ({
      ...prev,
      [id]: {
        enabled,
        lookerIds: enabled ? (prev[id]?.lookerIds ?? []) : [],
        justified: enabled ? (prev[id]?.justified ?? false) : false,
      },
    }))
  }

  const toggleLooker = (requesterId: string, lookerId: string) => {
    setSwaps((prev) => {
      const current = prev[requesterId] ?? {
        enabled: true,
        lookerIds: [],
        justified: false,
      }
      const lookerIds = current.lookerIds.includes(lookerId)
        ? current.lookerIds.filter((x) => x !== lookerId)
        : [...current.lookerIds, lookerId]
      return {
        ...prev,
        [requesterId]: { ...current, enabled: true, lookerIds },
      }
    })
  }

  const setJustified = (requesterId: string, justified: boolean) => {
    setSwaps((prev) => ({
      ...prev,
      [requesterId]: {
        ...(prev[requesterId] ?? {
          enabled: true,
          lookerIds: [],
          justified: false,
        }),
        enabled: true,
        justified,
      },
    }))
  }

  const draft: ToepenRoundInput = useMemo(() => {
    const folds = players
      .filter((p) => outcomes[p.id] === 'fold')
      .map((p) => ({
        playerId: p.id,
        stake: foldStakes[p.id] ?? startStake,
      }))
    const loserIds = players
      .filter((p) => outcomes[p.id] === 'lost')
      .map((p) => p.id)

    const swapList: ToepenSwap[] = players
      .filter((p) => swaps[p.id]?.enabled)
      .map((p) => ({
        requesterId: p.id,
        lookerIds: (swaps[p.id]?.lookerIds ?? []).filter((id) => id !== p.id),
        justified: swaps[p.id]?.justified ?? false,
      }))

    return {
      finalStake,
      folds,
      loserIds,
      swaps: swapList,
    }
  }, [players, outcomes, foldStakes, finalStake, startStake, swaps])

  const preview = toepenRoundPenalties(draft)
  const winnerCount = countToepenWinners(outcomes)
  const incomplete = players.some((p) => (outcomes[p.id] ?? 'unset') === 'unset')
  const hasHandResult = draft.folds.length > 0 || draft.loserIds.length > 0
  const hasSwapPenalty = draft.swaps.some((s) => s.lookerIds.length > 0)
  const singleWinnerOk = winnerCount === 1
  const canSubmit =
    !incomplete &&
    singleWinnerOk &&
    (hasHandResult || hasSwapPenalty)

  return (
    <section className="panel">
      <h2>{t('toepen.roundTitle')}</h2>
      <p className="hint">{t('toepen.roundHint')}</p>

      <div className="field">
        <label>{t('toepen.finalStake')}</label>
        <div className="stepper">
          <button
            type="button"
            onClick={() => setFinalStake((s) => Math.max(startStake, s - 1))}
            aria-label="-"
          >
            −
          </button>
          <span className="value">{finalStake}</span>
          <button
            type="button"
            onClick={() => setFinalStake((s) => s + 1)}
            aria-label="+"
          >
            +
          </button>
        </div>
        <p className="hint">{t('toepen.finalStakeHint')}</p>
      </div>

      <div className="field">
        <label>{t('toepen.outcomes')}</label>
        <p className="hint">{t('toepen.singleWinnerHint')}</p>
        <div className="toepen-outcomes">
          {players.map((p) => {
            const swap = swaps[p.id] ?? {
              enabled: false,
              lookerIds: [],
              justified: false,
            }
            const outcome = outcomes[p.id] ?? 'unset'
            return (
              <div className="toepen-outcome-row" key={p.id}>
                <strong>{p.name}</strong>
                <div className="toggle-grid three">
                  <button
                    type="button"
                    className={outcome === 'none' ? 'is-on' : ''}
                    onClick={() => setOutcome(p.id, 'none')}
                  >
                    {t('toepen.outcomeNone')}
                  </button>
                  <button
                    type="button"
                    className={outcome === 'fold' ? 'is-on' : ''}
                    onClick={() => setOutcome(p.id, 'fold')}
                  >
                    {t('toepen.outcomeFold')}
                  </button>
                  <button
                    type="button"
                    className={outcome === 'lost' ? 'is-on' : ''}
                    onClick={() => setOutcome(p.id, 'lost')}
                  >
                    {t('toepen.outcomeLost')}
                  </button>
                </div>

                {outcome === 'fold' && (
                  <div className="stepper compact">
                    <span className="hint">{t('toepen.foldStake')}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFoldStakes((prev) => ({
                          ...prev,
                          [p.id]: Math.max(
                            startStake,
                            (prev[p.id] ?? startStake) - 1,
                          ),
                        }))
                      }
                    >
                      −
                    </button>
                    <span className="value">
                      {foldStakes[p.id] ?? startStake}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFoldStakes((prev) => ({
                          ...prev,
                          [p.id]: (prev[p.id] ?? startStake) + 1,
                        }))
                      }
                    >
                      +
                    </button>
                  </div>
                )}
                {outcome === 'lost' && (
                  <p className="hint">
                    {t('toepen.lostAt', { n: finalStake })}
                  </p>
                )}

                <div className="field" style={{ marginTop: '0.25rem' }}>
                  <label>{t('toepen.swapAsked')}</label>
                  <div className="toggle-grid">
                    <button
                      type="button"
                      className={!swap.enabled ? 'is-on' : ''}
                      onClick={() => setSwapEnabled(p.id, false)}
                    >
                      {t('common.no')}
                    </button>
                    <button
                      type="button"
                      className={swap.enabled ? 'is-on' : ''}
                      onClick={() => setSwapEnabled(p.id, true)}
                    >
                      {t('common.yes')}
                    </button>
                  </div>
                </div>

                {swap.enabled && (
                  <>
                    <div className="field">
                      <label>{t('toepen.swapLookers')}</label>
                      <div className="choice-list">
                        {players
                          .filter((other) => other.id !== p.id)
                          .map((other) => (
                            <button
                              type="button"
                              key={other.id}
                              className={
                                swap.lookerIds.includes(other.id) ? 'is-on' : ''
                              }
                              onClick={() => toggleLooker(p.id, other.id)}
                            >
                              {other.name}
                            </button>
                          ))}
                      </div>
                      <p className="hint">{t('toepen.swapLookersHint')}</p>
                    </div>
                    {swap.lookerIds.length > 0 && (
                      <div className="field">
                        <label>{t('toepen.swapJustified')}</label>
                        <div className="toggle-grid">
                          <button
                            type="button"
                            className={swap.justified ? 'is-on' : ''}
                            onClick={() => setJustified(p.id, true)}
                          >
                            {t('toepen.swapYes')}
                          </button>
                          <button
                            type="button"
                            className={!swap.justified ? 'is-on' : ''}
                            onClick={() => setJustified(p.id, false)}
                          >
                            {t('toepen.swapNo')}
                          </button>
                        </div>
                        <p className="hint">
                          {swap.justified
                            ? t('toepen.swapJustifiedHint')
                            : t('toepen.swapUnjustifiedHint')}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {(preview[p.id] ?? 0) > 0 && (
                  <p className="distance">
                    {t('toepen.pointsThisRound', { n: preview[p.id] })}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {!singleWinnerOk && !incomplete && (
        <p className="hint">{t('toepen.singleWinnerError')}</p>
      )}
      {incomplete && (
        <p className="hint">{t('toepen.outcomesIncomplete')}</p>
      )}

      <button
        type="button"
        className="btn btn-primary btn-block"
        disabled={!canSubmit}
        onClick={() => onSubmit(draft)}
      >
        {correcting ? t('play.saveCorrection') : t('toepen.confirmRound')}
      </button>
      {correcting && onCancel && (
        <button
          type="button"
          className="btn btn-ghost btn-block"
          onClick={onCancel}
        >
          {t('play.cancel')}
        </button>
      )}
    </section>
  )
}
