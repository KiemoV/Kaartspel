import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GAME_CATALOG } from '../games/catalog'
import type { GameType } from '../types/game'
import type { ThemeMode } from '../hooks/useTheme'

interface Props {
  onSelect: (type: GameType) => void
  themeMode: ThemeMode
  onThemeChange: (mode: ThemeMode) => void
  onPrivacy: () => void
}

export function HomeScreen({
  onSelect,
  themeMode,
  onThemeChange,
  onPrivacy,
}: Props) {
  const { t, i18n } = useTranslation()
  const [selected, setSelected] = useState<GameType | null>(
    GAME_CATALOG[0]?.type ?? null,
  )

  const cycleTheme = () => {
    const order: ThemeMode[] = ['system', 'light', 'dark']
    const next = order[(order.indexOf(themeMode) + 1) % order.length]!
    onThemeChange(next)
  }

  const themeLabel =
    themeMode === 'light'
      ? t('nav.themeLight')
      : themeMode === 'dark'
        ? t('nav.themeDark')
        : t('nav.themeSystem')

  const selectedGame =
    GAME_CATALOG.find((game) => game.type === selected) ?? null

  return (
    <div className="home-screen">
      <div className="home-top">
        <button
          type="button"
          className="chip-btn"
          onClick={() =>
            void i18n.changeLanguage(i18n.language.startsWith('nl') ? 'en' : 'nl')
          }
        >
          {i18n.language.startsWith('nl') ? 'NL' : 'EN'}
        </button>
        <button type="button" className="chip-btn" onClick={cycleTheme}>
          {themeLabel}
        </button>
      </div>

      <header className="brand-hero">
        <p className="brand-eyebrow">PWA</p>
        <h1>{t('app.name')}</h1>
        <p className="brand-tagline">{t('app.tagline')}</p>
      </header>

      <section className="home-games" aria-label={t('home.chooseGame')}>
        <p className="section-label">{t('home.chooseGame')}</p>
        <div className="game-grid" role="listbox" aria-label={t('home.chooseGame')}>
          {GAME_CATALOG.map((game, index) => {
            const isOn = selected === game.type
            return (
              <button
                type="button"
                role="option"
                aria-selected={isOn}
                className={`game-tile ${isOn ? 'is-on' : ''}`}
                key={game.type}
                style={{ animationDelay: `${0.06 + index * 0.04}s` }}
                onClick={() => setSelected(game.type)}
              >
                <span className="game-tile-mark" aria-hidden>
                  {game.mark}
                </span>
                <span className="game-tile-title">{t(game.titleKey)}</span>
              </button>
            )
          })}
        </div>

        {selectedGame && (
          <div className="game-detail" key={selectedGame.type}>
            <div>
              <h2>{t(selectedGame.titleKey)}</h2>
              <p>{t(selectedGame.descKey)}</p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => onSelect(selectedGame.type)}
            >
              {t('home.continue')}
            </button>
          </div>
        )}
      </section>

      <footer className="home-footer">
        <p>{t('app.installHint')}</p>
        <button type="button" className="link-btn" onClick={onPrivacy}>
          {t('home.privacyLink')}
        </button>
      </footer>
    </div>
  )
}
