import { describe, expect, it } from 'vitest'
import { applyRound, correctRound, createGame, undoLastRound } from './engine'
import { toepenRoundPenalties } from './toepen'
import type { ToepenRoundInput } from '../types/game'

describe('toepen', () => {
  it('folders take fold stake; hand losers take final stake', () => {
    const penalties = toepenRoundPenalties({
      finalStake: 2,
      folds: [{ playerId: 'p1', stake: 1 }],
      loserIds: ['p2'],
      swaps: [],
    })
    expect(penalties).toEqual({ p1: 1, p2: 2 })
  })

  it('unjustified swap with looker penalizes requester by 1 on top', () => {
    const penalties = toepenRoundPenalties({
      finalStake: 2,
      folds: [],
      loserIds: ['p1'],
      swaps: [
        {
          requesterId: 'p1',
          lookerIds: ['p2'],
          justified: false,
        },
      ],
    })
    expect(penalties.p1).toBe(3) // lost 2 + unjustified 1
    expect(penalties.p2).toBeUndefined()
  })

  it('justified swap with looker penalizes looker by 1', () => {
    const penalties = toepenRoundPenalties({
      finalStake: 1,
      folds: [],
      loserIds: ['p3'],
      swaps: [
        {
          requesterId: 'p1',
          lookerIds: ['p2'],
          justified: true,
        },
      ],
    })
    expect(penalties).toEqual({ p3: 1, p2: 1 })
  })

  it('supports multiple card swaps in one round', () => {
    const penalties = toepenRoundPenalties({
      finalStake: 1,
      folds: [],
      loserIds: ['p3'],
      swaps: [
        {
          requesterId: 'p1',
          lookerIds: ['p2'],
          justified: false, // p1 +1
        },
        {
          requesterId: 'p2',
          lookerIds: ['p1'],
          justified: true, // p1 +1 again as looker
        },
      ],
    })
    expect(penalties.p1).toBe(2)
    expect(penalties.p2).toBeUndefined()
    expect(penalties.p3).toBe(1)
  })

  it('swap without lookers adds no swap penalty', () => {
    const penalties = toepenRoundPenalties({
      finalStake: 1,
      folds: [],
      loserIds: ['p1'],
      swaps: [
        {
          requesterId: 'p2',
          lookerIds: [],
          justified: false,
        },
      ],
    })
    expect(penalties).toEqual({ p1: 1 })
  })

  it('applies mixed fold and loss scores and eliminates above max', () => {
    let game = createGame('toepen', ['Ada', 'Ben', 'Cara'], {
      toepen: { maxScore: 5, startStake: 1, outRule: 'above' },
    })

    const round: ToepenRoundInput = {
      finalStake: 2,
      folds: [{ playerId: 'p1', stake: 1 }],
      loserIds: ['p2'],
      swaps: [],
    }
    game = applyRound(game, round)
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(1)
    expect(game.players.find((p) => p.id === 'p2')?.value).toBe(2)
    expect(game.players.find((p) => p.id === 'p3')?.value).toBe(0)

    game = applyRound(game, {
      finalStake: 3,
      folds: [],
      loserIds: ['p2'],
      swaps: [],
    })
    expect(game.players.find((p) => p.id === 'p2')?.value).toBe(5)
    expect(game.players.find((p) => p.id === 'p2')?.status).toBe('active')

    game = applyRound(game, {
      finalStake: 1,
      folds: [],
      loserIds: ['p2'],
      swaps: [],
    })
    expect(game.players.find((p) => p.id === 'p2')?.value).toBe(6)
    expect(game.players.find((p) => p.id === 'p2')?.status).toBe('out')
  })

  it('eliminates at max when outRule is at_or_above', () => {
    let game = createGame('toepen', ['Ada', 'Ben'], {
      toepen: { maxScore: 5, startStake: 1, outRule: 'at_or_above' },
    })
    game = applyRound(game, {
      finalStake: 5,
      folds: [],
      loserIds: ['p1'],
      swaps: [],
    })
    expect(game.players.find((p) => p.id === 'p1')?.status).toBe('out')
  })

  it('declares winner when one player remains', () => {
    let game = createGame('toepen', ['Ada', 'Ben'], {
      toepen: { maxScore: 2, startStake: 1, outRule: 'above' },
    })
    game = applyRound(game, {
      finalStake: 3,
      folds: [],
      loserIds: ['p1'],
      swaps: [],
    })
    expect(game.status).toBe('finished')
    expect(game.winnerId).toBe('p2')
  })

  it('recalculates after round correction and undo', () => {
    let game = createGame('toepen', ['Ada', 'Ben', 'Cara'], {
      toepen: { maxScore: 15, startStake: 1, outRule: 'above' },
    })
    game = applyRound(game, {
      finalStake: 2,
      folds: [{ playerId: 'p1', stake: 1 }],
      loserIds: ['p3'],
      swaps: [],
    })
    const roundId = game.rounds[0]!.id
    game = correctRound(game, roundId, {
      finalStake: 1,
      folds: [],
      loserIds: ['p2'],
      swaps: [],
    })
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(0)
    expect(game.players.find((p) => p.id === 'p2')?.value).toBe(1)
    expect(game.players.find((p) => p.id === 'p3')?.value).toBe(0)

    game = undoLastRound(game)
    expect(game.rounds).toHaveLength(0)
    expect(game.players.every((p) => p.value === 0)).toBe(true)
  })

  it('preserves wheel outcomes on correction', () => {
    let game = createGame('toepen', ['Ada', 'Ben'], {
      toepen: { maxScore: 15, startStake: 1, outRule: 'above' },
      wheel: {
        enabled: true,
        setId: 'challenges',
        customSegments: [],
        trigger: 'every_round',
      },
    })
    game = applyRound(
      game,
      { finalStake: 1, folds: [], loserIds: ['p1'], swaps: [] },
      { p1: 'Doe een dansje' },
    )
    const roundId = game.rounds[0]!.id
    game = correctRound(game, roundId, {
      finalStake: 2,
      folds: [],
      loserIds: ['p1'],
      swaps: [],
    })
    expect(game.rounds[0]!.wheelOutcomes).toEqual({ p1: 'Doe een dansje' })
    expect(game.players.find((p) => p.id === 'p1')?.value).toBe(2)
  })
})
