import { useTranslation } from 'react-i18next'
import type { GameType } from '../types/game'
import type { ThemeMode } from '../hooks/useTheme'

interface Props {
  onSelect: (type: GameType) => void
  themeMode: ThemeMode
  onThemeChange: (mode: ThemeMode) => void
}

export function HomeScreen({ onSelect, themeMode, onThemeChange }: Props) {
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
    <>
      <div className="topbar">
        <span />
        <div className="topbar-actions">
          <button
            type="button"
            className="chip-btn"
            onClick={() =>
              void i18n.changeLanguage(i18n.language.startsWith('nl') ? 'en' : 'nl')
            }
          >
            {i18n.language.startsWith('nl') ? 'NL → EN' : 'EN → NL'}
          </button>
          <button type="button" className="chip-btn" onClick={cycleTheme}>
            {themeLabel}
          </button>
        </div>
      </div>

      <header className="brand-hero">
        <h1>{t('app.name')}</h1>
        <p>{t('app.tagline')}</p>
      </header>

      <p className="section-label">{t('home.chooseGame')}</p>
      <div className="game-list">
        <button
          type="button"
          className="game-choice"
          onClick={() => onSelect('toepen')}
        >
          <strong>{t('home.toepen')}</strong>
          <span>{t('home.toepenDesc')}</span>
        </button>
        <button
          type="button"
          className="game-choice"
          onClick={() => onSelect('hartenjagen')}
        >
          <strong>{t('home.hartenjagen')}</strong>
          <span>{t('home.hartenjagenDesc')}</span>
        </button>
        <button
          type="button"
          className="game-choice"
          onClick={() => onSelect('eenendertigen')}
        >
          <strong>{t('home.eenendertigen')}</strong>
          <span>{t('home.eenendertigenDesc')}</span>
        </button>
      </div>

      <p className="install-hint">{t('app.installHint')}</p>
    </>
  )
}
