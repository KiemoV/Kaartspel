import type {
  Game,
  HartenjagenRoundInput,
  HartenjagenSettings,
  Player,
} from '../types/game'

export function initialPlayersHartenjagen(names: string[]): Player[] {
  return names.map((name, i) => ({
    id: `p${i + 1}`,
    name,
    value: 0,
    status: 'active' as const,
    inPhase2: false,
  }))
}

function reachedPhase1Limit(value: number, limit: number): boolean {
  return value >= limit
}

function reachedTarget(
  value: number,
  target: number,
  exact: boolean,
): boolean {
  if (exact) return value === target
  return value <= target
}

export function applyHartenjagenRounds(
  basePlayers: Player[],
  rounds: Game['rounds'],
  settings: HartenjagenSettings,
): { players: Player[]; winnerId: string | null; phase: 1 | 2 } {
  const players: Player[] = basePlayers.map((p) => ({
    ...p,
    value: 0,
    status: 'active' as const,
    inPhase2: false,
  }))

  let globalPhase: 1 | 2 = 1
  let winnerId: string | null = null

  for (const round of rounds) {
    if (winnerId) break
    const input = round.input as HartenjagenRoundInput

    for (const player of players) {
      if (player.status !== 'active') continue
      const delta = input.scores[player.id]
      if (delta === undefined || Number.isNaN(delta)) continue

      const inPhase2 =
        settings.phaseSwitch === 'all_together'
          ? globalPhase === 2
          : Boolean(player.inPhase2)

      if (inPhase2) {
        player.value -= delta
        if (reachedTarget(player.value, settings.phase2Target, settings.exactTarget)) {
          player.status = 'winner'
          winnerId = player.id
          // Mark others as still active but game ends
          break
        }
      } else {
        player.value += delta
        if (reachedPhase1Limit(player.value, settings.phase1Limit)) {
          if (settings.phaseSwitch === 'per_player') {
            player.inPhase2 = true
          }
        }
      }
    }

    if (
      settings.phaseSwitch === 'all_together' &&
      globalPhase === 1 &&
      players.some((p) => reachedPhase1Limit(p.value, settings.phase1Limit))
    ) {
      globalPhase = 2
      for (const p of players) {
        p.inPhase2 = true
      }
    }
  }

  return { players, winnerId, phase: globalPhase }
}

export function checkEndHartenjagen(winnerId: string | null): boolean {
  return winnerId !== null
}
