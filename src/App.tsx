import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createGame, restartGame } from './games/engine'
import { useBeforeUnload } from './hooks/useBeforeUnload'
import { useTheme } from './hooks/useTheme'
import { HomeScreen } from './screens/HomeScreen'
import { PlayScreen } from './screens/PlayScreen'
import { PrivacyScreen } from './screens/PrivacyScreen'
import { SetupScreen, type SetupResult } from './screens/SetupScreen'
import { WinnerScreen } from './screens/WinnerScreen'
import type { Game, GameType } from './types/game'

type Screen = 'home' | 'setup' | 'play' | 'winner' | 'privacy'

export default function App() {
  const { t } = useTranslation()
  const { mode, setMode } = useTheme()
  const [screen, setScreen] = useState<Screen>('home')
  const [selectedType, setSelectedType] = useState<GameType | null>(null)
  const [game, setGame] = useState<Game | null>(null)

  useBeforeUnload(screen === 'play', t('play.leaveWarning'))

  const handleSelect = (type: GameType) => {
    setSelectedType(type)
    setScreen('setup')
  }

  const handleStart = (result: SetupResult) => {
    if (!selectedType) return
    const next = createGame(selectedType, result.names, {
      toepen: result.toepen,
      hartenjagen: result.hartenjagen,
      eenendertigen: result.eenendertigen,
      wheel: result.wheel,
    })
    setGame(next)
    setScreen('play')
  }

  return (
    <div className="app-shell">
      {screen === 'home' && (
        <HomeScreen
          onSelect={handleSelect}
          themeMode={mode}
          onThemeChange={setMode}
          onPrivacy={() => setScreen('privacy')}
        />
      )}
      {screen === 'privacy' && (
        <PrivacyScreen onBack={() => setScreen('home')} />
      )}
      {screen === 'setup' && selectedType && (
        <SetupScreen
          type={selectedType}
          onBack={() => setScreen('home')}
          onStart={handleStart}
        />
      )}
      {screen === 'play' && game && (
        <PlayScreen
          game={game}
          onChange={setGame}
          onFinished={() => setScreen('winner')}
          onHome={() => {
            setGame(null)
            setSelectedType(null)
            setScreen('home')
          }}
        />
      )}
      {screen === 'winner' && game && (
        <WinnerScreen
          game={game}
          onPlayAgain={() => {
            const next = restartGame(game)
            setGame(next)
            setScreen('play')
          }}
          onNewGame={() => {
            setGame(null)
            setSelectedType(null)
            setScreen('home')
          }}
        />
      )}
    </div>
  )
}
