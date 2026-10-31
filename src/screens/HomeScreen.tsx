import { useTranslation } from 'react-i18next'
import type { GameType } from '../types/game'
import type { ThemeMode } from '../hooks/useTheme'

interface Props {
  onSelect: (type: GameType) => void
  themeMode: ThemeMode
  onThemeChange: (mode: ThemeMode) => void
  onPrivacy: () => void
}

const GAMES: { type: GameType; titleKey: string; descKey: string }[] = [
  { type: 'toepen', titleKey: 'home.toepen', descKey: 'home.toepenDesc' },
  {
    type: 'hartenjagen',
    titleKey: 'home.hartenjagen',
    descKey: 'home.hartenjagenDesc',
  },
  {
    type: 'eenendertigen',
    titleKey: 'home.eenendertigen',
    descKey: 'home.eenendertigenDesc',
  },
]

export function HomeScreen({
  onSelect,
  themeMode,
  onThemeChange,
  onPrivacy,
}: Props) {
  const { t, i18n } = useTranslation()

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
        <div className="game-list">
          {GAMES.map((game, index) => (
            <button
              type="button"
              className="game-choice"
              key={game.type}
              style={{ animationDelay: `${0.08 + index * 0.06}s` }}
              onClick={() => onSelect(game.type)}
            >
              <strong>{t(game.titleKey)}</strong>
              <span>{t(game.descKey)}</span>
            </button>
          ))}
        </div>
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
