import React, { useState, useCallback, useEffect } from 'react';
import Gameboard from './components/Gameboard';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import SettingsScreen from './components/SettingsScreen';
import { type GameState, type GameSpeed, type Floor } from './types';
import { trackEvent } from './analytics';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState<number>(0);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [ladderThreshold, setLadderThreshold] = useState<number>(50);
  const [gameSpeed, setGameSpeed] = useState<GameSpeed>('normal');
  const [floorNames, setFloorNames] = useState<Record<Floor, string>>({
    1: 'The Ground Floor',
  });

  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  const handleStart = useCallback(() => {
    setScore(0);
    setIsNewHighScore(false);
    setGameState('playing');
    trackEvent('start_game');
  }, []);

  const handleGameOver = useCallback((currentScore: number) => {
    setFinalScore(currentScore);
    trackEvent('game_over', { score: currentScore });
    if (currentScore > highScore) {
      setHighScore(currentScore);
      setIsNewHighScore(true);
      localStorage.setItem('snakeHighScore', currentScore.toString());
      trackEvent('new_high_score', { score: currentScore });
    } else {
      setIsNewHighScore(false);
    }
    setGameState('gameOver');
  }, [highScore]);

  const handleRestart = useCallback(() => {
    handleStart();
  }, [handleStart]);

  const handleOpenSettings = useCallback(() => setIsSettingsOpen(true), []);
  const handleCloseSettings = useCallback(() => setIsSettingsOpen(false), []);

  const handleThresholdChange = useCallback((value: number) => {
    if (value > 0) {
      setLadderThreshold(value);
      trackEvent('change_setting', { setting_id: 'ladder_threshold', setting_value: value });
    }
  }, []);

  const handleGameSpeedChange = useCallback((speed: GameSpeed) => {
    setGameSpeed(speed);
    trackEvent('change_setting', { setting_id: 'game_speed', setting_value: speed });
  }, []);

  const renderContent = () => {
    switch (gameState) {
      case 'playing':
        return (
          <Gameboard
            score={score}
            setScore={setScore}
            onGameOver={handleGameOver}
            ladderThreshold={ladderThreshold}
            highScore={highScore}
            gameSpeed={gameSpeed}
            floorNames={floorNames}
            setFloorNames={setFloorNames}
          />
        );
      case 'gameOver':
        return (
          <GameOverScreen 
            score={finalScore} 
            onRestart={handleRestart} 
            highScore={highScore}
            isNewHighScore={isNewHighScore}
            onOpenSettings={handleOpenSettings}
          />
        );
      case 'idle':
      default:
        return (
          <StartScreen 
            onStart={handleStart} 
            onOpenSettings={handleOpenSettings} 
            highScore={highScore} 
          />
        );
    }
  };

  return (
    <main className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center font-mono p-4">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <header className="mb-4 text-center">
          <h1 className="text-5xl font-bold tracking-wider text-emerald-400">
            Ladder Snake
          </h1>
          <p className="text-slate-400 mt-2">
            Climb an endless tower of floors!
          </p>
        </header>
        {renderContent()}
      </div>
      <SettingsScreen
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        ladderThreshold={ladderThreshold}
        onThresholdChange={handleThresholdChange}
        gameSpeed={gameSpeed}
        onGameSpeedChange={handleGameSpeedChange}
      />
    </main>
  );
};

export default App;