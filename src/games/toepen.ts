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
    for (const loserId of input.loserIds) {
      const player = players.find((p) => p.id === loserId)
      if (!player || player.status === 'out') continue
      player.value += input.stake
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
    // Edge: everyone out somehow — last who went out is not winner; pick lowest score among out
    const sorted = [...players].sort((a, b) => a.value - b.value)
    sorted[0].status = 'winner'
    winnerId = sorted[0].id
  }

  return { players, winnerId }
}

export function checkEndToepen(players: Player[]): boolean {
  return players.filter((p) => p.status === 'active').length <= 1
}
