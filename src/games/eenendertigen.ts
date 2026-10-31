import type {
  EenendertigenRoundInput,
  EenendertigenSettings,
  Game,
  Player,
} from '../types/game'

export function initialPlayersEenendertigen(
  names: string[],
  settings: EenendertigenSettings,
): Player[] {
  const startValue = settings.mode === 'lives' ? settings.startLives : 0
  return names.map((name, i) => ({
    id: `p${i + 1}`,
    name,
    value: startValue,
    status: 'active' as const,
  }))
}

export function distanceTo31(hand: number): number {
  return 31 - hand
}

function activePlayers(players: Player[]): Player[] {
  return players.filter(
    (p) => p.status === 'active' || p.status === 'swimming',
  )
}

function loseLife(
  player: Player,
  settings: EenendertigenSettings,
): void {
  if (player.status === 'swimming') {
    player.status = 'out'
    player.value = 0
    return
  }

  player.value -= 1
  if (player.value > 0) return

  if (settings.swimming && player.value === 0) {
    player.value = 0
    player.status = 'swimming'
    return
  }

  player.value = 0
  player.status = 'out'
}

export function applyEenendertigenRounds(
  basePlayers: Player[],
  rounds: Game['rounds'],
  settings: EenendertigenSettings,
  playerCount: number,
): { players: Player[]; winnerId: string | null } {
  const startValue = settings.mode === 'lives' ? settings.startLives : 0
  const players: Player[] = basePlayers.map((p) => ({
    ...p,
    value: startValue,
    status: 'active' as const,
  }))

  let winnerId: string | null = null

  if (settings.mode === 'lives') {
    for (const round of rounds) {
      const input = round.input as EenendertigenRoundInput
      const alive = activePlayers(players)
      if (alive.length <= 1) break

      const hands = alive
        .map((p) => ({ id: p.id, hand: input.hands[p.id] }))
        .filter((h) => h.hand !== undefined && !Number.isNaN(h.hand))

      if (hands.length === 0) continue

      const minHand = Math.min(...hands.map((h) => h.hand))
      const lowest = hands.filter((h) => h.hand === minHand)

      let loserIds: string[]
      if (lowest.length === 1) {
        loserIds = [lowest[0].id]
      } else if (settings.lowestTie === 'choose_one' && input.chosenLoserId) {
        loserIds = lowest.some((l) => l.id === input.chosenLoserId)
          ? [input.chosenLoserId]
          : lowest.map((l) => l.id)
      } else {
        loserIds = lowest.map((l) => l.id)
      }

      for (const id of loserIds) {
        const player = players.find((p) => p.id === id)
        if (player) loseLife(player, settings)
      }

      const remaining = activePlayers(players)
      if (remaining.length === 1) {
        remaining[0].status = 'winner'
        winnerId = remaining[0].id
        break
      }
    }
  } else {
    // Points mode: accumulate distance as penalty
    for (const round of rounds) {
      const input = round.input as EenendertigenRoundInput
      for (const player of players) {
        const hand = input.hands[player.id]
        if (hand === undefined || Number.isNaN(hand)) continue
        player.value += distanceTo31(hand)
      }
    }

    const roundLimit =
      settings.pointsEnd === 'fixed_rounds'
        ? settings.fixedRounds > 0
          ? settings.fixedRounds
          : playerCount
        : Infinity

    const hitLimit =
      settings.pointsEnd === 'points_limit' &&
      players.some((p) => p.value >= settings.pointsLimit)

    const enoughRounds =
      settings.pointsEnd === 'fixed_rounds' && rounds.length >= roundLimit

    if (hitLimit || enoughRounds) {
      const sorted = [...players].sort((a, b) => a.value - b.value)
      sorted[0].status = 'winner'
      winnerId = sorted[0].id
    }
  }

  return { players, winnerId }
}

export function checkEndEenendertigen(winnerId: string | null): boolean {
  return winnerId !== null
}
