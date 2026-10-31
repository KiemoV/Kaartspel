import { describe, expect, it } from 'vitest'
import { applyRound, createGame } from './engine'

describe('vrij', () => {
  it('adds points each round until max is reached', () => {
    let game = createGame('vrij', ['Ada', 'Ben'], {
      vrij: { maxScore: 10, winAtOrAbove: true },
    })
    game = applyRound(game, { scores: { p1: 4, p2: 3 } })
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(4)
    expect(game.status).toBe('playing')

    game = applyRound(game, { scores: { p1: 6, p2: 1 } })
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(10)
    expect(game.status).toBe('finished')
    expect(game.winnerId).toBe('p1')
  })

  it('highest score wins when multiple hit the max in one round', () => {
    let game = createGame('vrij', ['Ada', 'Ben', 'Cara'], {
      vrij: { maxScore: 10, winAtOrAbove: true },
    })
    game = applyRound(game, { scores: { p1: 12, p2: 10, p3: 2 } })
    expect(game.winnerId).toBe('p1')
    expect(game.status).toBe('finished')
  })
})
