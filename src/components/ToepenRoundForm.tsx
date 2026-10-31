import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toepenRoundPenalties } from '../games/toepen'
import type { Player, ToepenRoundInput, ToepenSettings } from '../types/game'

type Outcome = 'none' | 'fold' | 'lost'

interface Props {
  players: Player[]
  settings: ToepenSettings
  initial?: ToepenRoundInput
  correcting: boolean
  onSubmit: (input: ToepenRoundInput) => void
  onCancel?: () => void
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
    for (const p of players) {
      if (initial?.loserIds.includes(p.id)) map[p.id] = 'lost'
      else if (initial?.folds.some((f) => f.playerId === p.id)) map[p.id] = 'fold'
      else map[p.id] = 'none'
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

  const [swapEnabled, setSwapEnabled] = useState(Boolean(initial?.swap))
  const [requesterId, setRequesterId] = useState(
    initial?.swap?.requesterId ?? players[0]?.id ?? '',
  )
  const [lookerIds, setLookerIds] = useState<string[]>(
    initial?.swap?.lookerIds ?? [],
  )
  const [justified, setJustified] = useState(
    initial?.swap?.justified ?? false,
  )

  const setOutcome = (id: string, outcome: Outcome) => {
    setOutcomes((prev) => ({ ...prev, [id]: outcome }))
    if (outcome === 'fold') {
      setFoldStakes((prev) => ({
        ...prev,
        [id]: prev[id] ?? Math.max(startStake, finalStake - 1),
      }))
    }
  }

  const toggleLooker = (id: string) => {
    setLookerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
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

    const input: ToepenRoundInput = {
      finalStake,
      folds,
      loserIds,
    }
    if (swapEnabled && requesterId) {
      input.swap = {
        requesterId,
        lookerIds: lookerIds.filter((id) => id !== requesterId),
        justified,
      }
    }
    return input
  }, [
    players,
    outcomes,
    foldStakes,
    finalStake,
    startStake,
    swapEnabled,
    requesterId,
    lookerIds,
    justified,
  ])

  const preview = toepenRoundPenalties(draft)
  const hasResult =
    draft.folds.length > 0 ||
    draft.loserIds.length > 0 ||
    (draft.swap !== undefined &&
      draft.swap.lookerIds.length > 0)

  return (
    <section className="panel">
      <h2>{t('toepen.roundTitle')}</h2>
      <p className="hint">{t('toepen.roundHint')}</p>

      <div className="field">
        <label>{t('toepen.swapTitle')}</label>
        <div className="toggle-grid">
          <button
            type="button"
            className={!swapEnabled ? 'is-on' : ''}
            onClick={() => setSwapEnabled(false)}
          >
            {t('common.off')}
          </button>
          <button
            type="button"
            className={swapEnabled ? 'is-on' : ''}
            onClick={() => setSwapEnabled(true)}
          >
            {t('common.on')}
          </button>
        </div>
      </div>

      {swapEnabled && (
        <>
          <div className="field">
            <label>{t('toepen.swapRequester')}</label>
            <div className="choice-list">
              {players.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={requesterId === p.id ? 'is-on' : ''}
                  onClick={() => {
                    setRequesterId(p.id)
                    setLookerIds((prev) => prev.filter((id) => id !== p.id))
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>{t('toepen.swapLookers')}</label>
            <div className="choice-list">
              {players
                .filter((p) => p.id !== requesterId)
                .map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    className={lookerIds.includes(p.id) ? 'is-on' : ''}
                    onClick={() => toggleLooker(p.id)}
                  >
                    {p.name}
                  </button>
                ))}
            </div>
            <p className="hint">{t('toepen.swapLookersHint')}</p>
          </div>
          {lookerIds.length > 0 && (
            <div className="field">
              <label>{t('toepen.swapJustified')}</label>
              <div className="toggle-grid">
                <button
                  type="button"
                  className={justified ? 'is-on' : ''}
                  onClick={() => setJustified(true)}
                >
                  {t('toepen.swapYes')}
                </button>
                <button
                  type="button"
                  className={!justified ? 'is-on' : ''}
                  onClick={() => setJustified(false)}
                >
                  {t('toepen.swapNo')}
                </button>
              </div>
              <p className="hint">
                {justified
                  ? t('toepen.swapJustifiedHint')
                  : t('toepen.swapUnjustifiedHint')}
              </p>
            </div>
          )}
        </>
      )}

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
        <div className="toepen-outcomes">
          {players.map((p) => (
            <div className="toepen-outcome-row" key={p.id}>
              <strong>{p.name}</strong>
              <div className="toggle-grid three">
                <button
                  type="button"
                  className={outcomes[p.id] === 'none' ? 'is-on' : ''}
                  onClick={() => setOutcome(p.id, 'none')}
                >
                  {t('toepen.outcomeNone')}
                </button>
                <button
                  type="button"
                  className={outcomes[p.id] === 'fold' ? 'is-on' : ''}
                  onClick={() => setOutcome(p.id, 'fold')}
                >
                  {t('toepen.outcomeFold')}
                </button>
                <button
                  type="button"
                  className={outcomes[p.id] === 'lost' ? 'is-on' : ''}
                  onClick={() => setOutcome(p.id, 'lost')}
                >
                  {t('toepen.outcomeLost')}
                </button>
              </div>
              {outcomes[p.id] === 'fold' && (
                <div className="stepper compact">
                  <span className="hint">{t('toepen.foldStake')}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFoldStakes((prev) => ({
                        ...prev,
                        [p.id]: Math.max(startStake, (prev[p.id] ?? startStake) - 1),
                      }))
                    }
                  >
                    −
                  </button>
                  <span className="value">{foldStakes[p.id] ?? startStake}</span>
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
              {outcomes[p.id] === 'lost' && (
                <p className="hint">
                  {t('toepen.lostAt', { n: finalStake })}
                </p>
              )}
              {(preview[p.id] ?? 0) > 0 && (
                <p className="distance">
                  {t('toepen.pointsThisRound', { n: preview[p.id] })}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-block"
        disabled={!hasResult}
        onClick={() => onSubmit(draft)}
      >
        {correcting ? t('play.saveCorrection') : t('toepen.confirmRound')}
      </button>
      {correcting && onCancel && (
        <button type="button" className="btn btn-ghost btn-block" onClick={onCancel}>
          {t('play.cancel')}
        </button>
      )}
    </section>
  )
}
