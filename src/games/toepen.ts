import type {
  Game,
  Player,
  ToepenRoundInput,
  ToepenSettings,
} from '../types/game'

function isOut(value: number, settings: ToepenSettings): boolean {
  return settings.outRule === 'above'
    ? value > settings.maxScore
    : value >= settings.maxScore
}

export function initialPlayersToepen(names: string[]): Player[] {
  return names.map((name, i) => ({
    id: `p${i + 1}`,
    name,
    value: 0,
    status: 'active' as const,
  }))
}

/** Points each player receives from one toepen round (hand + swap). */
export function toepenRoundPenalties(
  input: ToepenRoundInput,
): Record<string, number> {
  const penalties: Record<string, number> = {}
  const add = (id: string, n: number) => {
    if (n <= 0) return
    penalties[id] = (penalties[id] ?? 0) + n
  }

  for (const fold of input.folds) {
    add(fold.playerId, fold.stake)
  }
  for (const id of input.loserIds) {
    add(id, input.finalStake)
  }

  if (input.swap && input.swap.lookerIds.length > 0) {
    if (input.swap.justified) {
      for (const id of input.swap.lookerIds) {
        add(id, 1)
      }
    } else {
      add(input.swap.requesterId, 1)
    }
  }

  return penalties
}

export function applyToepenRounds(
  basePlayers: Player[],
  rounds: Game['rounds'],
  settings: ToepenSettings,
): { players: Player[]; winnerId: string | null } {
  const players: Player[] = basePlayers.map((p) => ({
    ...p,
    value: 0,
    status: 'active' as const,
  }))

  for (const round of rounds) {
    const input = round.input as ToepenRoundInput
    const penalties = toepenRoundPenalties(input)
    for (const [playerId, points] of Object.entries(penalties)) {
      const player = players.find((p) => p.id === playerId)
      if (!player || player.status === 'out') continue
      player.value += points
      if (isOut(player.value, settings)) {
        player.status = 'out'
      }
    }
  }

  const active = players.filter((p) => p.status === 'active')
  let winnerId: string | null = null
  if (active.length === 1) {
    active[0].status = 'winner'
    winnerId = active[0].id
  } else if (active.length === 0 && players.length > 0) {
    const sorted = [...players].sort((a, b) => a.value - b.value)
    sorted[0].status = 'winner'
    winnerId = sorted[0].id
  }

  return { players, winnerId }
}

export function checkEndToepen(players: Player[]): boolean {
  return players.filter((p) => p.status === 'active').length <= 1
}
