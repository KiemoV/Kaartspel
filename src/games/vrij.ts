import type {
  Game,
  Player,
  VrijRoundInput,
  VrijSettings,
} from '../types/game'

export function initialPlayersVrij(names: string[]): Player[] {
  return names.map((name, i) => ({
    id: `p${i + 1}`,
    name,
    value: 0,
    status: 'active' as const,
  }))
}

function reachedMax(value: number, settings: VrijSettings): boolean {
  return settings.winAtOrAbove
    ? value >= settings.maxScore
    : value > settings.maxScore
}

export function applyVrijRounds(
  basePlayers: Player[],
  rounds: Game['rounds'],
  settings: VrijSettings,
): { players: Player[]; winnerId: string | null } {
  const players: Player[] = basePlayers.map((p) => ({
    ...p,
    value: 0,
    status: 'active' as const,
  }))

  let winnerId: string | null = null

  for (const round of rounds) {
    if (winnerId) break
    const input = round.input as VrijRoundInput
    for (const player of players) {
      if (player.status !== 'active') continue
      const delta = input.scores[player.id]
      if (delta === undefined || Number.isNaN(delta)) continue
      player.value += delta
    }

    const reached = players.filter(
      (p) => p.status === 'active' && reachedMax(p.value, settings),
    )
    if (reached.length === 0) continue

    reached.sort((a, b) => b.value - a.value)
    const top = reached[0]!
    const tied = reached.filter((p) => p.value === top.value)
    // If multiple hit the max with the same score, first in table order wins.
    const winner = tied[0]!
    winner.status = 'winner'
    winnerId = winner.id
  }

  return { players, winnerId }
}

export function checkEndVrij(winnerId: string | null): boolean {
  return winnerId !== null
}
