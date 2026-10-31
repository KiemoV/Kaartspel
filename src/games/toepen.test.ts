import { describe, expect, it } from 'vitest'
import { applyRound, correctRound, createGame, undoLastRound } from './engine'

describe('toepen', () => {
  it('adds stake to losers and eliminates above max', () => {
    let game = createGame('toepen', ['Ada', 'Ben', 'Cara'], {
      toepen: { maxScore: 5, startStake: 1, outRule: 'above' },
    })

    game = applyRound(game, { stake: 3, loserIds: ['p1'] })
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(3)
    expect(game.players.find((p) => p.id === 'p1')?.status).toBe('active')

    game = applyRound(game, { stake: 3, loserIds: ['p1'] })
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(6)
    expect(game.players.find((p) => p.id === 'p1')?.status).toBe('out')
  })

  it('eliminates at max when outRule is at_or_above', () => {
    let game = createGame('toepen', ['Ada', 'Ben'], {
      toepen: { maxScore: 5, startStake: 1, outRule: 'at_or_above' },
    })
    game = applyRound(game, { stake: 5, loserIds: ['p1'] })
    expect(game.players.find((p) => p.id === 'p1')?.status).toBe('out')
  })

  it('declares winner when one player remains', () => {
    let game = createGame('toepen', ['Ada', 'Ben'], {
      toepen: { maxScore: 2, startStake: 1, outRule: 'above' },
    })
    game = applyRound(game, { stake: 3, loserIds: ['p1'] })
    expect(game.status).toBe('finished')
    expect(game.winnerId).toBe('p2')
    expect(game.players.find((p) => p.id === 'p2')?.status).toBe('winner')
  })

  it('supports multiple losers in one round', () => {
    let game = createGame('toepen', ['Ada', 'Ben', 'Cara'], {
      toepen: { maxScore: 15, startStake: 1, outRule: 'above' },
    })
    game = applyRound(game, { stake: 2, loserIds: ['p1', 'p2'] })
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(2)
    expect(game.players.find((p) => p.id === 'p2')?.value).toBe(2)
    expect(game.players.find((p) => p.id === 'p3')?.value).toBe(0)
  })

  it('recalculates after round correction and undo', () => {
    let game = createGame('toepen', ['Ada', 'Ben', 'Cara'], {
      toepen: { maxScore: 15, startStake: 1, outRule: 'above' },
    })
    game = applyRound(game, { stake: 4, loserIds: ['p1'] })
    const roundId = game.rounds[0]!.id
    game = correctRound(game, roundId, { stake: 1, loserIds: ['p2'] })
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(0)
    expect(game.players.find((p) => p.id === 'p2')?.value).toBe(1)

    game = undoLastRound(game)
    expect(game.rounds).toHaveLength(0)
    expect(game.players.every((p) => p.value === 0)).toBe(true)
  })

  it('preserves wheel outcomes on correction', () => {
    let game = createGame('toepen', ['Ada', 'Ben'], {
      toepen: { maxScore: 15, startStake: 1, outRule: 'above' },
      wheel: { enabled: true, setId: 'challenges', customSegments: [], trigger: 'every_round' },
    })
    game = applyRound(game, { stake: 1, loserIds: ['p1'] }, { p1: 'Doe een dansje' })
    const roundId = game.rounds[0]!.id
    game = correctRound(game, roundId, { stake: 2, loserIds: ['p1'] })
    expect(game.rounds[0]!.wheelOutcomes).toEqual({ p1: 'Doe een dansje' })
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(2)
  })
})
