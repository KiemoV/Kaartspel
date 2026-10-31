import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  EenendertigenSettings,
  GameType,
  HartenjagenSettings,
  ToepenSettings,
  VrijSettings,
  WheelSettings,
  WheelSetId,
  WheelTrigger,
} from '../types/game'
import {
  DEFAULT_EENENDERTIGEN,
  DEFAULT_HARTENJAGEN,
  DEFAULT_TOEPEN,
  DEFAULT_VRIJ,
  DEFAULT_WHEEL,
} from '../types/game'

export interface SetupResult {
  names: string[]
  toepen: ToepenSettings
  hartenjagen: HartenjagenSettings
  eenendertigen: EenendertigenSettings
  vrij: VrijSettings
  wheel: WheelSettings
}

interface Props {
  type: GameType
  onBack: () => void
  onStart: (result: SetupResult) => void
}

export function SetupScreen({ type, onBack, onStart }: Props) {
  const { t, i18n } = useTranslation()
  const [names, setNames] = useState(['', ''])
  const [toepen, setToepen] = useState<ToepenSettings>({ ...DEFAULT_TOEPEN })
  const [hartenjagen, setHartenjagen] = useState<HartenjagenSettings>({
    ...DEFAULT_HARTENJAGEN,
  })
  const [eenendertigen, setEenendertigen] = useState<EenendertigenSettings>({
    ...DEFAULT_EENENDERTIGEN,
  })
  const [vrij, setVrij] = useState<VrijSettings>({ ...DEFAULT_VRIJ })
  const [wheel, setWheel] = useState<WheelSettings>({ ...DEFAULT_WHEEL })

  const title =
    type === 'toepen'
      ? t('home.toepen')
      : type === 'hartenjagen'
        ? t('home.hartenjagen')
        : type === 'vrij'
          ? t('home.vrij')
          : t('home.eenendertigen')

  const validNames = names.map((n) => n.trim()).filter(Boolean)
  const canStart = validNames.length >= 2 && validNames.length <= 10

  const updateName = (index: number, value: string) => {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)))
  }

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

      <h1 className="screen-title">{title}</h1>
      <p className="muted-on-felt">{t('setup.lockedNote')}</p>

      <section className="panel">
        <h2>{t('setup.players')}</h2>
        {names.map((name, i) => (
          <div className="player-row" key={i}>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor={`player-${i}`}>{t('setup.playerName', { n: i + 1 })}</label>
              <input
                id={`player-${i}`}
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                autoComplete="off"
              />
            </div>
            {names.length > 2 && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setNames((prev) => prev.filter((_, j) => j !== i))}
              >
                {t('setup.removePlayer')}
              </button>
            )}
          </div>
        ))}
        {names.length < 10 && (
          <button
            type="button"
            className="btn"
            onClick={() => setNames((prev) => [...prev, ''])}
          >
            {t('setup.addPlayer')}
          </button>
        )}
        {validNames.length < 2 && <p className="hint">{t('setup.minPlayers')}</p>}
      </section>

      {type === 'toepen' && (
        <section className="panel">
          <h2>{t('setup.title')}</h2>
          <div className="field">
            <label htmlFor="maxScore">{t('toepen.maxScore')}</label>
            <input
              id="maxScore"
              type="number"
              min={1}
              value={toepen.maxScore}
              onChange={(e) =>
                setToepen((s) => ({ ...s, maxScore: Number(e.target.value) || 15 }))
              }
            />
          </div>
          <div className="field">
            <label htmlFor="startStake">{t('toepen.startStake')}</label>
            <input
              id="startStake"
              type="number"
              min={1}
              value={toepen.startStake}
              onChange={(e) =>
                setToepen((s) => ({
                  ...s,
                  startStake: Number(e.target.value) || 1,
                }))
              }
            />
          </div>
          <div className="field">
            <label>{t('toepen.outRule')}</label>
            <div className="toggle-grid">
              <button
                type="button"
                className={toepen.outRule === 'above' ? 'is-on' : ''}
                onClick={() => setToepen((s) => ({ ...s, outRule: 'above' }))}
              >
                {t('toepen.outAbove')}
              </button>
              <button
                type="button"
                className={toepen.outRule === 'at_or_above' ? 'is-on' : ''}
                onClick={() =>
                  setToepen((s) => ({ ...s, outRule: 'at_or_above' }))
                }
              >
                {t('toepen.outAtOrAbove')}
              </button>
            </div>
          </div>
        </section>
      )}

      {type === 'hartenjagen' && (
        <section className="panel">
          <h2>{t('setup.title')}</h2>
          <div className="field">
            <label htmlFor="phase1">{t('hartenjagen.phase1Limit')}</label>
            <input
              id="phase1"
              type="number"
              min={1}
              value={hartenjagen.phase1Limit}
              onChange={(e) =>
                setHartenjagen((s) => ({
                  ...s,
                  phase1Limit: Number(e.target.value) || 50,
                }))
              }
            />
          </div>
          <div className="field">
            <label htmlFor="phase2">{t('hartenjagen.phase2Target')}</label>
            <input
              id="phase2"
              type="number"
              value={hartenjagen.phase2Target}
              onChange={(e) =>
                setHartenjagen((s) => ({
                  ...s,
                  phase2Target: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div className="field">
            <label>{t('hartenjagen.phaseSwitch')}</label>
            <div className="toggle-grid">
              <button
                type="button"
                className={
                  hartenjagen.phaseSwitch === 'all_together' ? 'is-on' : ''
                }
                onClick={() =>
                  setHartenjagen((s) => ({
                    ...s,
                    phaseSwitch: 'all_together',
                  }))
                }
              >
                {t('hartenjagen.phaseAll')}
              </button>
              <button
                type="button"
                className={
                  hartenjagen.phaseSwitch === 'per_player' ? 'is-on' : ''
                }
                onClick={() =>
                  setHartenjagen((s) => ({ ...s, phaseSwitch: 'per_player' }))
                }
              >
                {t('hartenjagen.phasePerPlayer')}
              </button>
            </div>
          </div>
          <div className="field">
            <label>{t('hartenjagen.exactTarget')}</label>
            <div className="toggle-grid">
              <button
                type="button"
                className={!hartenjagen.exactTarget ? 'is-on' : ''}
                onClick={() =>
                  setHartenjagen((s) => ({ ...s, exactTarget: false }))
                }
              >
                {t('hartenjagen.exactNo')}
              </button>
              <button
                type="button"
                className={hartenjagen.exactTarget ? 'is-on' : ''}
                onClick={() =>
                  setHartenjagen((s) => ({ ...s, exactTarget: true }))
                }
              >
                {t('hartenjagen.exactYes')}
              </button>
            </div>
          </div>
        </section>
      )}

      {type === 'vrij' && (
        <section className="panel">
          <h2>{t('setup.title')}</h2>
          <div className="field">
            <label htmlFor="vrijMax">{t('vrij.maxScore')}</label>
            <input
              id="vrijMax"
              type="number"
              min={1}
              value={vrij.maxScore}
              onChange={(e) =>
                setVrij((s) => ({
                  ...s,
                  maxScore: Number(e.target.value) || 100,
                }))
              }
            />
          </div>
          <div className="field">
            <label>{t('vrij.winRule')}</label>
            <div className="toggle-grid">
              <button
                type="button"
                className={vrij.winAtOrAbove ? 'is-on' : ''}
                onClick={() => setVrij((s) => ({ ...s, winAtOrAbove: true }))}
              >
                {t('vrij.winAtOrAbove')}
              </button>
              <button
                type="button"
                className={!vrij.winAtOrAbove ? 'is-on' : ''}
                onClick={() => setVrij((s) => ({ ...s, winAtOrAbove: false }))}
              >
                {t('vrij.winAbove')}
              </button>
            </div>
          </div>
        </section>
      )}

      {type === 'eenendertigen' && (
        <section className="panel">
          <h2>{t('setup.title')}</h2>
          <div className="field">
            <label>{t('eenendertigen.mode')}</label>
            <div className="toggle-grid">
              <button
                type="button"
                className={eenendertigen.mode === 'lives' ? 'is-on' : ''}
                onClick={() =>
                  setEenendertigen((s) => ({ ...s, mode: 'lives' }))
                }
              >
                {t('eenendertigen.modeLives')}
              </button>
              <button
                type="button"
                className={eenendertigen.mode === 'points' ? 'is-on' : ''}
                onClick={() =>
                  setEenendertigen((s) => ({ ...s, mode: 'points' }))
                }
              >
                {t('eenendertigen.modePoints')}
              </button>
            </div>
          </div>

          {eenendertigen.mode === 'lives' ? (
            <>
              <div className="field">
                <label htmlFor="lives">{t('eenendertigen.startLives')}</label>
                <input
                  id="lives"
                  type="number"
                  min={1}
                  value={eenendertigen.startLives}
                  onChange={(e) =>
                    setEenendertigen((s) => ({
                      ...s,
                      startLives: Number(e.target.value) || 3,
                    }))
                  }
                />
              </div>
              <div className="field">
                <label>{t('eenendertigen.swimming')}</label>
                <div className="toggle-grid">
                  <button
                    type="button"
                    className={eenendertigen.swimming ? 'is-on' : ''}
                    onClick={() =>
                      setEenendertigen((s) => ({ ...s, swimming: true }))
                    }
                  >
                    {t('eenendertigen.swimmingOn')}
                  </button>
                  <button
                    type="button"
                    className={!eenendertigen.swimming ? 'is-on' : ''}
                    onClick={() =>
                      setEenendertigen((s) => ({ ...s, swimming: false }))
                    }
                  >
                    {t('eenendertigen.swimmingOff')}
                  </button>
                </div>
              </div>
              <div className="field">
                <label>{t('eenendertigen.lowestTie')}</label>
                <div className="toggle-grid">
                  <button
                    type="button"
                    className={eenendertigen.lowestTie === 'all' ? 'is-on' : ''}
                    onClick={() =>
                      setEenendertigen((s) => ({ ...s, lowestTie: 'all' }))
                    }
                  >
                    {t('eenendertigen.tieAll')}
                  </button>
                  <button
                    type="button"
                    className={
                      eenendertigen.lowestTie === 'choose_one' ? 'is-on' : ''
                    }
                    onClick={() =>
                      setEenendertigen((s) => ({
                        ...s,
                        lowestTie: 'choose_one',
                      }))
                    }
                  >
                    {t('eenendertigen.tieChoose')}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="field">
                <label>{t('eenendertigen.pointsEnd')}</label>
                <div className="toggle-grid">
                  <button
                    type="button"
                    className={
                      eenendertigen.pointsEnd === 'fixed_rounds' ? 'is-on' : ''
                    }
                    onClick={() =>
                      setEenendertigen((s) => ({
                        ...s,
                        pointsEnd: 'fixed_rounds',
                      }))
                    }
                  >
                    {t('eenendertigen.fixedRounds')}
                  </button>
                  <button
                    type="button"
                    className={
                      eenendertigen.pointsEnd === 'points_limit' ? 'is-on' : ''
                    }
                    onClick={() =>
                      setEenendertigen((s) => ({
                        ...s,
                        pointsEnd: 'points_limit',
                      }))
                    }
                  >
                    {t('eenendertigen.pointsLimit')}
                  </button>
                </div>
              </div>
              {eenendertigen.pointsEnd === 'fixed_rounds' ? (
                <div className="field">
                  <label htmlFor="rounds">{t('eenendertigen.roundCount')}</label>
                  <input
                    id="rounds"
                    type="number"
                    min={1}
                    placeholder={String(validNames.length || 2)}
                    value={eenendertigen.fixedRounds || ''}
                    onChange={(e) =>
                      setEenendertigen((s) => ({
                        ...s,
                        fixedRounds: Number(e.target.value) || 0,
                      }))
                    }
                  />
                  <p className="hint">
                    {t('eenendertigen.roundCount')}:{' '}
                    {eenendertigen.fixedRounds || validNames.length || 2}
                  </p>
                </div>
              ) : (
                <div className="field">
                  <label htmlFor="plimit">{t('eenendertigen.pointsLimit')}</label>
                  <input
                    id="plimit"
                    type="number"
                    min={1}
                    value={eenendertigen.pointsLimit}
                    onChange={(e) =>
                      setEenendertigen((s) => ({
                        ...s,
                        pointsLimit: Number(e.target.value) || 100,
                      }))
                    }
                  />
                </div>
              )}
            </>
          )}
        </section>
      )}

      <section className="panel">
        <h2>{t('setup.wheel')}</h2>
        <div className="field">
          <label>{t('setup.wheelEnabled')}</label>
          <div className="toggle-grid">
            <button
              type="button"
              className={!wheel.enabled ? 'is-on' : ''}
              onClick={() => setWheel((w) => ({ ...w, enabled: false }))}
            >
              {t('common.off')}
            </button>
            <button
              type="button"
              className={wheel.enabled ? 'is-on' : ''}
              onClick={() => setWheel((w) => ({ ...w, enabled: true }))}
            >
              {t('common.on')}
            </button>
          </div>
        </div>

        {wheel.enabled && (
          <>
            <div className="field">
              <label htmlFor="wheelSet">{t('setup.wheelSet')}</label>
              <select
                id="wheelSet"
                value={wheel.setId}
                onChange={(e) =>
                  setWheel((w) => ({
                    ...w,
                    setId: e.target.value as WheelSetId,
                  }))
                }
              >
                <option value="challenges">{t('setup.wheelSetChallenges')}</option>
                <option value="drinks">{t('setup.wheelSetDrinks')}</option>
                <option value="nonalcoholic">
                  {t('setup.wheelSetNonalcoholic')}
                </option>
                <option value="custom">{t('setup.wheelSetCustom')}</option>
              </select>
            </div>
            {wheel.setId === 'custom' && (
              <div className="field">
                <label htmlFor="customSegs">
                  {t('setup.wheelCustomPlaceholder')}
                </label>
                <textarea
                  id="customSegs"
                  value={wheel.customSegments.join('\n')}
                  onChange={(e) =>
                    setWheel((w) => ({
                      ...w,
                      customSegments: e.target.value.split('\n'),
                    }))
                  }
                  placeholder={t('setup.wheelCustomPlaceholder')}
                />
              </div>
            )}
            <div className="field">
              <label htmlFor="wheelTrigger">{t('setup.wheelTrigger')}</label>
              <select
                id="wheelTrigger"
                value={wheel.trigger}
                onChange={(e) =>
                  setWheel((w) => ({
                    ...w,
                    trigger: e.target.value as WheelTrigger,
                  }))
                }
              >
                <option value="every_round">{t('setup.wheelTriggerEvery')}</option>
                <option value="on_elimination">
                  {t('setup.wheelTriggerElimination')}
                </option>
                <option value="at_end">{t('setup.wheelTriggerEnd')}</option>
              </select>
            </div>
          </>
        )}
      </section>

      <button
        type="button"
        className="btn btn-primary btn-block"
        disabled={!canStart}
        onClick={() =>
          onStart({
            names: validNames,
            toepen,
            hartenjagen,
            eenendertigen,
            vrij,
            wheel,
          })
        }
      >
        {t('setup.start')}
      </button>
    </>
  )
}
