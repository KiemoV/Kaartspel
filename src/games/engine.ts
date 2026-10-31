import type {
  EenendertigenSettings,
  Game,
  GameType,
  HartenjagenSettings,
  Player,
  Round,
  RoundInput,
  ToepenSettings,
  VrijSettings,
  WheelSettings,
} from '../types/game'
import {
  DEFAULT_EENENDERTIGEN,
  DEFAULT_HARTENJAGEN,
  DEFAULT_TOEPEN,
  DEFAULT_VRIJ,
  DEFAULT_WHEEL,
} from '../types/game'
import {
  applyEenendertigenRounds,
  checkEndEenendertigen,
  initialPlayersEenendertigen,
} from './eenendertigen'
import {
  applyHartenjagenRounds,
  checkEndHartenjagen,
  initialPlayersHartenjagen,
} from './hartenjagen'
import {
  applyToepenRounds,
  checkEndToepen,
  initialPlayersToepen,
} from './toepen'
import {
  applyVrijRounds,
  checkEndVrij,
  initialPlayersVrij,
} from './vrij'

function baseNames(players: Player[]): string[] {
  return players.map((p) => p.name)
}

export function createGame(
  type: GameType,
  names: string[],
  partial?: {
    toepen?: Partial<ToepenSettings>
    hartenjagen?: Partial<HartenjagenSettings>
    eenendertigen?: Partial<EenendertigenSettings>
    vrij?: Partial<VrijSettings>
    wheel?: Partial<WheelSettings>
  },
): Game {
  const wheel: WheelSettings = { ...DEFAULT_WHEEL, ...partial?.wheel }

  if (type === 'toepen') {
    const toepen = { ...DEFAULT_TOEPEN, ...partial?.toepen }
    return {
      type,
      settings: { type: 'toepen', toepen, wheel },
      players: initialPlayersToepen(names),
      rounds: [],
      status: 'playing',
      winnerId: null,
    }
  }

  if (type === 'hartenjagen') {
    const hartenjagen = { ...DEFAULT_HARTENJAGEN, ...partial?.hartenjagen }
    return {
      type,
      settings: { type: 'hartenjagen', hartenjagen, wheel },
      players: initialPlayersHartenjagen(names),
      rounds: [],
      status: 'playing',
      winnerId: null,
      phase: 1,
    }
  }

  if (type === 'vrij') {
    const vrij = { ...DEFAULT_VRIJ, ...partial?.vrij }
    return {
      type,
      settings: { type: 'vrij', vrij, wheel },
      players: initialPlayersVrij(names),
      rounds: [],
      status: 'playing',
      winnerId: null,
    }
  }

  const eenendertigen = {
    ...DEFAULT_EENENDERTIGEN,
    ...partial?.eenendertigen,
  }
  if (eenendertigen.fixedRounds === 0) {
    eenendertigen.fixedRounds = names.length
  }
  return {
    type,
    settings: { type: 'eenendertigen', eenendertigen, wheel },
    players: initialPlayersEenendertigen(names, eenendertigen),
    rounds: [],
    status: 'playing',
    winnerId: null,
  }
}

export function recalculate(game: Game): Game {
  const names = baseNames(game.players)
  const ids = game.players.map((p) => p.id)

  if (game.type === 'toepen' && game.settings.type === 'toepen') {
    const base = initialPlayersToepen(names).map((p, i) => ({
      ...p,
      id: ids[i] ?? p.id,
    }))
    const { players, winnerId } = applyToepenRounds(
      base,
      game.rounds,
      game.settings.toepen,
    )
    const finished = checkEndToepen(players)
    return {
      ...game,
      players,
      winnerId,
      status: finished ? 'finished' : 'playing',
    }
  }

  if (game.type === 'hartenjagen' && game.settings.type === 'hartenjagen') {
    const base = initialPlayersHartenjagen(names).map((p, i) => ({
      ...p,
      id: ids[i] ?? p.id,
    }))
    const { players, winnerId, phase } = applyHartenjagenRounds(
      base,
      game.rounds,
      game.settings.hartenjagen,
    )
    const finished = checkEndHartenjagen(winnerId)
    return {
      ...game,
      players,
      winnerId,
      phase,
      status: finished ? 'finished' : 'playing',
    }
  }

  if (game.type === 'vrij' && game.settings.type === 'vrij') {
    const base = initialPlayersVrij(names).map((p, i) => ({
      ...p,
      id: ids[i] ?? p.id,
    }))
    const { players, winnerId } = applyVrijRounds(
      base,
      game.rounds,
      game.settings.vrij,
    )
    const finished = checkEndVrij(winnerId)
    return {
      ...game,
      players,
      winnerId,
      status: finished ? 'finished' : 'playing',
    }
  }

  if (game.settings.type !== 'eenendertigen') {
    return game
  }

  const base = initialPlayersEenendertigen(
    names,
    game.settings.eenendertigen,
  ).map((p, i) => ({
    ...p,
    id: ids[i] ?? p.id,
  }))
  const { players, winnerId } = applyEenendertigenRounds(
    base,
    game.rounds,
    game.settings.eenendertigen,
    names.length,
  )
  const finished = checkEndEenendertigen(winnerId)
  return {
    ...game,
    players,
    winnerId,
    status: finished ? 'finished' : 'playing',
  }
}

export function applyRound(
  game: Game,
  input: RoundInput,
  wheelOutcomes?: Record<string, string>,
): Game {
  const round: Round = {
    id: `r${game.rounds.length + 1}-${Date.now()}`,
    input,
    wheelOutcomes,
  }
  return recalculate({
    ...game,
    rounds: [...game.rounds, round],
  })
}

export function correctRound(
  game: Game,
  roundId: string,
  input: RoundInput,
): Game {
  const rounds = game.rounds.map((r) =>
    r.id === roundId
      ? { ...r, input, wheelOutcomes: r.wheelOutcomes }
      : r,
  )
  return recalculate({ ...game, rounds })
}

export function undoLastRound(game: Game): Game {
  if (game.rounds.length === 0) return game
  return recalculate({
    ...game,
    rounds: game.rounds.slice(0, -1),
  })
}

export function restartGame(game: Game): Game {
  return createGame(
    game.type,
    game.players.map((p) => p.name),
    {
      toepen:
        game.settings.type === 'toepen' ? game.settings.toepen : undefined,
      hartenjagen:
        game.settings.type === 'hartenjagen'
          ? game.settings.hartenjagen
          : undefined,
      eenendertigen:
        game.settings.type === 'eenendertigen'
          ? game.settings.eenendertigen
          : undefined,
      vrij: game.settings.type === 'vrij' ? game.settings.vrij : undefined,
      wheel: game.settings.wheel,
    },
  )
}

/** Losers of the most recent round (for wheel). */
export function lastRoundLoserIds(game: Game): string[] {
  if (game.rounds.length === 0) return []
  const last = game.rounds[game.rounds.length - 1]
  const before = recalculate({
    ...game,
    rounds: game.rounds.slice(0, -1),
  })
  const after = game

  if (game.type === 'toepen') {
    return after.players
      .filter((p) => {
        const prev = before.players.find((b) => b.id === p.id)
        return prev && p.value > prev.value
      })
      .map((p) => p.id)
  }

  if (game.type === 'eenendertigen' && game.settings.type === 'eenendertigen') {
    if (game.settings.eenendertigen.mode === 'lives') {
      return after.players
        .filter((p) => {
          const prev = before.players.find((b) => b.id === p.id)
          if (!prev) return false
          return (
            p.value < prev.value ||
            (prev.status !== 'out' && p.status === 'out') ||
            (prev.status === 'active' && p.status === 'swimming') ||
            (prev.status === 'swimming' && p.status === 'out')
          )
        })
        .map((p) => p.id)
    }
    const hands = (last.input as { hands: Record<string, number> }).hands
    const dists = Object.entries(hands).map(([id, hand]) => ({
      id,
      dist: 31 - hand,
    }))
    if (dists.length === 0) return []
    const max = Math.max(...dists.map((d) => d.dist))
    return dists.filter((d) => d.dist === max).map((d) => d.id)
  }

  if (game.type === 'hartenjagen' || game.type === 'vrij') {
    const scores = (last.input as { scores: Record<string, number> }).scores
    const entries = Object.entries(scores)
    if (entries.length === 0) return []
    const max = Math.max(...entries.map(([, v]) => v))
    return entries.filter(([, v]) => v === max).map(([id]) => id)
  }

  return []
}

export function newlyEliminatedIds(game: Game): string[] {
  if (game.rounds.length === 0) return []
  const before = recalculate({
    ...game,
    rounds: game.rounds.slice(0, -1),
  })
  return game.players
    .filter((p) => {
      const prev = before.players.find((b) => b.id === p.id)
      return prev && prev.status !== 'out' && p.status === 'out'
    })
    .map((p) => p.id)
}
