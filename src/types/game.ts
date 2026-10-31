export type GameType = 'toepen' | 'hartenjagen' | 'eenendertigen' | 'vrij'

export type PlayerStatus = 'active' | 'out' | 'winner' | 'swimming'

export type GameStatus = 'setup' | 'playing' | 'finished'

export type WheelSetId = 'challenges' | 'drinks' | 'nonalcoholic' | 'custom'

export type WheelTrigger = 'every_round' | 'on_elimination' | 'at_end'

export type PhaseSwitch = 'all_together' | 'per_player'

export type OutRule = 'above' | 'at_or_above'

export type LowestTieRule = 'all' | 'choose_one'

export type PointsEndMode = 'fixed_rounds' | 'points_limit'

export interface Player {
  id: string
  name: string
  value: number
  status: PlayerStatus
  /** Hartenjagen: whether this player has entered phase 2 (per-player mode). */
  inPhase2?: boolean
}

export interface WheelSettings {
  enabled: boolean
  setId: WheelSetId
  customSegments: string[]
  trigger: WheelTrigger
}

export interface ToepenSettings {
  maxScore: number
  startStake: number
  outRule: OutRule
}

export interface HartenjagenSettings {
  phase1Limit: number
  phase2Target: number
  phaseSwitch: PhaseSwitch
  exactTarget: boolean
}

export interface EenendertigenSettings {
  mode: 'lives' | 'points'
  startLives: number
  swimming: boolean
  lowestTie: LowestTieRule
  pointsEnd: PointsEndMode
  fixedRounds: number
  pointsLimit: number
}

/** Free scoring: add points each round until someone hits the maximum. */
export interface VrijSettings {
  maxScore: number
  /** Win when reaching or exceeding the maximum. */
  winAtOrAbove: boolean
}

export type GameSettings =
  | { type: 'toepen'; toepen: ToepenSettings; wheel: WheelSettings }
  | { type: 'hartenjagen'; hartenjagen: HartenjagenSettings; wheel: WheelSettings }
  | { type: 'eenendertigen'; eenendertigen: EenendertigenSettings; wheel: WheelSettings }
  | { type: 'vrij'; vrij: VrijSettings; wheel: WheelSettings }

/** Player folded when the stake was raised; they take this many points. */
export interface ToepenFold {
  playerId: string
  stake: number
}

export interface ToepenSwap {
  requesterId: string
  lookerIds: string[]
  /** Only matters when someone looked. */
  justified: boolean
}

/**
 * Toepen round: start at startStake; toepen raises the stake.
 * Folders take the stake they folded at; hand losers take finalStake.
 * Multiple players may request a card swap; each can have lookers.
 */
export interface ToepenRoundInput {
  finalStake: number
  folds: ToepenFold[]
  loserIds: string[]
  swaps: ToepenSwap[]
}

export interface HartenjagenRoundInput {
  scores: Record<string, number>
}

export interface EenendertigenRoundInput {
  hands: Record<string, number>
  /** When lowestTie is choose_one and there is a tie. */
  chosenLoserId?: string
}

export interface VrijRoundInput {
  /** Points scored this round per player. */
  scores: Record<string, number>
}

export type RoundInput =
  | ToepenRoundInput
  | HartenjagenRoundInput
  | EenendertigenRoundInput
  | VrijRoundInput

export interface Round {
  id: string
  input: RoundInput
  /** playerId -> segment label; preserved on correction */
  wheelOutcomes?: Record<string, string>
}

export interface Game {
  type: GameType
  settings: GameSettings
  players: Player[]
  rounds: Round[]
  status: GameStatus
  winnerId: string | null
  /** Derived: global phase for hartenjagen all_together mode */
  phase?: 1 | 2
}

export const DEFAULT_TOEPEN: ToepenSettings = {
  maxScore: 15,
  startStake: 1,
  outRule: 'above',
}

export const DEFAULT_HARTENJAGEN: HartenjagenSettings = {
  phase1Limit: 50,
  phase2Target: 0,
  phaseSwitch: 'all_together',
  exactTarget: false,
}

export const DEFAULT_EENENDERTIGEN: EenendertigenSettings = {
  mode: 'lives',
  startLives: 3,
  swimming: true,
  lowestTie: 'all',
  pointsEnd: 'fixed_rounds',
  fixedRounds: 0, // 0 = use player count at start
  pointsLimit: 100,
}

export const DEFAULT_VRIJ: VrijSettings = {
  maxScore: 100,
  winAtOrAbove: true,
}

export const DEFAULT_WHEEL: WheelSettings = {
  enabled: false,
  setId: 'challenges',
  customSegments: [],
  trigger: 'every_round',
}
