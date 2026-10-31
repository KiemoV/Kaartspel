import { useTranslation } from 'react-i18next'

interface Props {
  onBack: () => void
}

export function PrivacyScreen({ onBack }: Props) {
  const { t, i18n } = useTranslation()

  return (
    <>
      <div className="topbar">
        <button type="button" className="chip-btn" onClick={onBack}>
          {t('nav.back')}
        </button>
        <button
          type="button"
          className="chip-btn"
          onClick={() =>
            void i18n.changeLanguage(i18n.language.startsWith('nl') ? 'en' : 'nl')
          }
        >
          {i18n.language.startsWith('nl') ? 'NL → EN' : 'EN → NL'}
        </button>
      </div>

      <h1 className="screen-title">{t('privacy.title')}</h1>
      <p className="muted-on-felt">{t('privacy.updated')}</p>

      <section className="panel privacy-copy">
        <p>{t('privacy.intro')}</p>
        <h2>{t('privacy.dataTitle')}</h2>
        <p>{t('privacy.dataBody')}</p>
        <h2>{t('privacy.storageTitle')}</h2>
        <p>{t('privacy.storageBody')}</p>
        <h2>{t('privacy.networkTitle')}</h2>
        <p>{t('privacy.networkBody')}</p>
        <h2>{t('privacy.contactTitle')}</h2>
        <p>{t('privacy.contactBody')}</p>
      </section>
    </>
  )
}
