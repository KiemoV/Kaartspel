import { describe, expect, it } from 'vitest'
import { distanceTo31 } from './eenendertigen'
import { applyRound, correctRound, createGame } from './engine'

describe('eenendertigen', () => {
  it('computes distance to 31 including 30.5', () => {
    expect(distanceTo31(31)).toBe(0)
    expect(distanceTo31(30.5)).toBe(0.5)
    expect(distanceTo31(20)).toBe(11)
  })

  it('lives mode: lowest hand loses a life', () => {
    let game = createGame('eenendertigen', ['Ada', 'Ben', 'Cara'], {
      eenendertigen: {
        mode: 'lives',
        startLives: 2,
        swimming: false,
        lowestTie: 'all',
        pointsEnd: 'fixed_rounds',
        fixedRounds: 3,
        pointsLimit: 100,
      },
    })
    game = applyRound(game, { hands: { p1: 10, p2: 20, p3: 25 } })
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(1)
    expect(game.players.find((p) => p.id === 'p2')?.value).toBe(2)
  })

  it('lives mode: all lowest lose on tie when configured', () => {
    let game = createGame('eenendertigen', ['Ada', 'Ben', 'Cara'], {
      eenendertigen: {
        mode: 'lives',
        startLives: 1,
        swimming: false,
        lowestTie: 'all',
        pointsEnd: 'fixed_rounds',
        fixedRounds: 3,
        pointsLimit: 100,
      },
    })
    game = applyRound(game, { hands: { p1: 10, p2: 10, p3: 25 } })
    expect(game.players.find((p) => p.id === 'p1')?.status).toBe('out')
    expect(game.players.find((p) => p.id === 'p2')?.status).toBe('out')
    expect(game.status).toBe('finished')
    expect(game.winnerId).toBe('p3')
  })

  it('lives mode: choose_one tie picks chosen loser', () => {
    let game = createGame('eenendertigen', ['Ada', 'Ben', 'Cara'], {
      eenendertigen: {
        mode: 'lives',
        startLives: 2,
        swimming: false,
        lowestTie: 'choose_one',
        pointsEnd: 'fixed_rounds',
        fixedRounds: 3,
        pointsLimit: 100,
      },
    })
    game = applyRound(game, {
      hands: { p1: 10, p2: 10, p3: 25 },
      chosenLoserId: 'p2',
    })
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(2)
    expect(game.players.find((p) => p.id === 'p2')?.value).toBe(1)
  })

  it('lives mode: swimming keeps player active at 0 once', () => {
    let game = createGame('eenendertigen', ['Ada', 'Ben'], {
      eenendertigen: {
        mode: 'lives',
        startLives: 1,
        swimming: true,
        lowestTie: 'all',
        pointsEnd: 'fixed_rounds',
        fixedRounds: 3,
        pointsLimit: 100,
      },
    })
    game = applyRound(game, { hands: { p1: 5, p2: 20 } })
    expect(game.players.find((p) => p.id === 'p1')?.status).toBe('swimming')
    expect(game.status).toBe('playing')

    game = applyRound(game, { hands: { p1: 5, p2: 20 } })
    expect(game.players.find((p) => p.id === 'p1')?.status).toBe('out')
    expect(game.winnerId).toBe('p2')
  })

  it('points mode: accumulates distance and ends after fixed rounds', () => {
    let game = createGame('eenendertigen', ['Ada', 'Ben'], {
      eenendertigen: {
        mode: 'points',
        startLives: 3,
        swimming: false,
        lowestTie: 'all',
        pointsEnd: 'fixed_rounds',
        fixedRounds: 2,
        pointsLimit: 100,
      },
    })
    game = applyRound(game, { hands: { p1: 31, p2: 20 } })
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(0)
    expect(game.players.find((p) => p.id === 'p2')?.value).toBe(11)
    expect(game.status).toBe('playing')

    game = applyRound(game, { hands: { p1: 30.5, p2: 25 } })
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(0.5)
    expect(game.players.find((p) => p.id === 'p2')?.value).toBe(17)
    expect(game.status).toBe('finished')
    expect(game.winnerId).toBe('p1')
  })

  it('points mode: ends at points limit', () => {
    let game = createGame('eenendertigen', ['Ada', 'Ben'], {
      eenendertigen: {
        mode: 'points',
        startLives: 3,
        swimming: false,
        lowestTie: 'all',
        pointsEnd: 'points_limit',
        fixedRounds: 10,
        pointsLimit: 10,
      },
    })
    game = applyRound(game, { hands: { p1: 31, p2: 20 } }) // p2 gets 11
    expect(game.status).toBe('finished')
    expect(game.winnerId).toBe('p1')
  })

  it('recalculates lives after correcting a round', () => {
    let game = createGame('eenendertigen', ['Ada', 'Ben', 'Cara'], {
      eenendertigen: {
        mode: 'lives',
        startLives: 3,
        swimming: false,
        lowestTie: 'all',
        pointsEnd: 'fixed_rounds',
        fixedRounds: 3,
        pointsLimit: 100,
      },
    })
    game = applyRound(game, { hands: { p1: 10, p2: 20, p3: 25 } })
    const id = game.rounds[0]!.id
    game = correctRound(game, id, { hands: { p1: 28, p2: 10, p3: 25 } })
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(3)
    expect(game.players.find((p) => p.id === 'p2')?.value).toBe(2)
  })
})
