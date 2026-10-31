import type { GameType } from '../types/game'

export interface GameCatalogItem {
  type: GameType
  titleKey: string
  descKey: string
  /** Short mark shown on the compact tile. */
  mark: string
}

/** Registry for the home picker — add new games here. */
export const GAME_CATALOG: GameCatalogItem[] = [
  {
    type: 'toepen',
    titleKey: 'home.toepen',
    descKey: 'home.toepenDesc',
    mark: 'T',
  },
  {
    type: 'hartenjagen',
    titleKey: 'home.hartenjagen',
    descKey: 'home.hartenjagenDesc',
    mark: 'H',
  },
  {
    type: 'eenendertigen',
    titleKey: 'home.eenendertigen',
    descKey: 'home.eenendertigenDesc',
    mark: '31',
  },
]
