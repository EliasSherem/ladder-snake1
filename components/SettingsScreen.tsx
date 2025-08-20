import React from 'react';
import { type GameSpeed } from '../types';

interface SettingsScreenProps {
  isOpen: boolean;
  onClose: () => void;
  ladderThreshold: number;
  onThresholdChange: (value: number) => void;
  gameSpeed: GameSpeed;
  onGameSpeedChange: (speed: GameSpeed) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
    isOpen, 
    onClose, 
    ladderThreshold, 
    onThresholdChange,
    gameSpeed,
    onGameSpeedChange,
}) => {
  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onThresholdChange(value);
    } else if (e.target.value === '') {
      // When the input is cleared, default to the minimum value of 20.
      onThresholdChange(20);
    }
  };

  const handleCloseWithValidation = () => {
    // Before closing, ensure the threshold is not below the minimum.
    if (ladderThreshold < 20) {
      onThresholdChange(20);
    }
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseWithValidation();
    }
  };
  
  const getSpeedButtonClass = (speed: GameSpeed) => {
    const baseClasses = "flex-1 px-4 py-2 text-lg font-bold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800";
    if (speed === gameSpeed) {
      return `${baseClasses} bg-emerald-500 text-white focus:ring-emerald-400`;
    }
    return `${baseClasses} bg-slate-700 text-slate-300 hover:bg-slate-600 focus:ring-slate-500`;
  }

  return (
    <div 
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in"
        onClick={handleOverlayClick}
    >
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md text-white m-4 flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-center text-emerald-400">Settings</h2>
        
        <div>
          <label htmlFor="ladder-threshold" className="block text-lg text-slate-300 mb-2">
            Points for Next Ladder
          </label>
          <input
            type="number"
            id="ladder-threshold"
            value={ladderThreshold}
            onChange={handleInputChange}
            min="20"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-describedby="ladder-threshold-description"
          />
          <p id="ladder-threshold-description" className="text-sm text-slate-400 mt-2">
            Set how many points you need for a new ladder to appear. Minimum: 20.
          </p>
        </div>
        
        <div>
            <label className="block text-lg text-slate-300 mb-2">
                Game Speed
            </label>
            <div className="flex justify-between gap-2" role="group" aria-label="Game Speed">
                <button onClick={() => onGameSpeedChange('slow')} className={getSpeedButtonClass('slow')}>Slow</button>
                <button onClick={() => onGameSpeedChange('normal')} className={getSpeedButtonClass('normal')}>Normal</button>
                <button onClick={() => onGameSpeedChange('fast')} className={getSpeedButtonClass('fast')}>Fast</button>
                <button onClick={() => onGameSpeedChange('impossible')} className={getSpeedButtonClass('impossible')}>Impossible</button>
            </div>
            <p className="text-sm text-slate-400 mt-2">
                Adjust the snake's movement speed.
            </p>
        </div>

        <div className="flex justify-center mt-2">
          <button
            onClick={handleCloseWithValidation}
            className="px-8 py-3 bg-emerald-500 text-white font-bold text-xl rounded-lg hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-400/50 transform hover:scale-105 transition-transform duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;