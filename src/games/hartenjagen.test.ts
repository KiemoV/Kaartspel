import { describe, expect, it } from 'vitest'
import { applyRound, createGame } from './engine'

describe('hartenjagen', () => {
  it('switches everyone to phase 2 when first hits the limit', () => {
    let game = createGame('hartenjagen', ['Ada', 'Ben'], {
      hartenjagen: {
        phase1Limit: 10,
        phase2Target: 0,
        phaseSwitch: 'all_together',
        exactTarget: false,
      },
    })

    game = applyRound(game, { scores: { p1: 10, p2: 3 } })
    expect(game.phase).toBe(2)
    expect(game.players.every((p) => p.inPhase2)).toBe(true)
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(10)

    game = applyRound(game, { scores: { p1: 5, p2: 2 } })
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(5)
    expect(game.players.find((p) => p.id === 'p2')?.value).toBe(1)
  })

  it('switches phase per player independently', () => {
    let game = createGame('hartenjagen', ['Ada', 'Ben'], {
      hartenjagen: {
        phase1Limit: 10,
        phase2Target: 0,
        phaseSwitch: 'per_player',
        exactTarget: false,
      },
    })

    game = applyRound(game, { scores: { p1: 10, p2: 2 } })
    expect(game.players.find((p) => p.id === 'p1')?.inPhase2).toBe(true)
    expect(game.players.find((p) => p.id === 'p2')?.inPhase2).toBe(false)

    game = applyRound(game, { scores: { p1: 3, p2: 4 } })
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(7) // 10 - 3
    expect(game.players.find((p) => p.id === 'p2')?.value).toBe(6) // 2 + 4
  })

  it('wins when reaching target at or below (non-exact)', () => {
    let game = createGame('hartenjagen', ['Ada', 'Ben'], {
      hartenjagen: {
        phase1Limit: 5,
        phase2Target: 0,
        phaseSwitch: 'all_together',
        exactTarget: false,
      },
    })
    game = applyRound(game, { scores: { p1: 5, p2: 1 } })
    game = applyRound(game, { scores: { p1: 6, p2: 0 } })
    expect(game.status).toBe('finished')
    expect(game.winnerId).toBe('p1')
  })

  it('requires exact target when configured', () => {
    let game = createGame('hartenjagen', ['Ada', 'Ben'], {
      hartenjagen: {
        phase1Limit: 5,
        phase2Target: 0,
        phaseSwitch: 'all_together',
        exactTarget: true,
      },
    })
    game = applyRound(game, { scores: { p1: 5, p2: 1 } })
    game = applyRound(game, { scores: { p1: 6, p2: 0 } }) // p1 goes to -1, not exact 0
    expect(game.status).toBe('playing')
    expect(game.winnerId).toBeNull()

    game = applyRound(game, { scores: { p1: 0, p2: 1 } }) // p1 still -1
    // Bring p2 to exact 0: value is 1, subtract 1
    // Actually after previous: p1=-1, p2=1. Then scores p1:0 p2:1 -> p1=-1, p2=0
    expect(game.players.find((p) => p.id === 'p2')?.value).toBe(0)
    expect(game.winnerId).toBe('p2')
    expect(game.status).toBe('finished')
  })
})
