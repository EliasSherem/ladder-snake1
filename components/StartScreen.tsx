
import React from 'react';
import AdComponent from './AdComponent';

interface StartScreenProps {
  onStart: () => void;
  onOpenSettings: () => void;
  highScore: number;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onOpenSettings, highScore }) => {
  return (
    <div className="text-center p-4 md:p-8 bg-slate-800/50 rounded-lg shadow-2xl flex flex-col items-center max-w-3xl">
      {highScore > 0 && (
        <div className="mb-6 text-xl">
          <span className="text-slate-400">High Score: </span>
          <span className="font-bold text-emerald-400">{highScore}</span>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onStart}
          className="px-8 py-4 bg-emerald-500 text-white font-bold text-2xl rounded-lg hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-400/50 transform hover:scale-105 transition-transform duration-200"
        >
          Start Game
        </button>
        <button
            onClick={onOpenSettings}
            aria-label="Game Settings"
            className="p-4 bg-slate-700 text-white rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-500/50 transform hover:scale-105 transition-transform duration-200"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </button>
      </div>

      <div className="w-full text-left space-y-6 mb-8">
        <div className="p-4 bg-slate-900/40 rounded-lg">
            <h3 className="text-2xl font-bold text-emerald-400 mb-3 text-center">How to Play</h3>
            <ul className="list-disc list-inside space-y-2 text-lg text-slate-300">
                <li>Use <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Arrow Keys</kbd> or on-screen controls to move the snake.</li>
                <li>Eat the <span className="text-rose-400 font-bold">red blocks</span> to grow longer and increase your score.</li>
                <li>Climb the shimmering <span className="text-amber-400 font-bold">ladders</span> to ascend to the next floor.</li>
                <li>Avoid running into the walls or your own tail, or it's game over!</li>
            </ul>
        </div>

        <div className="p-4 bg-slate-900/40 rounded-lg">
            <h3 className="text-2xl font-bold text-emerald-400 mb-3 text-center">Pro Tips</h3>
            <ul className="list-disc list-inside space-y-2 text-lg text-slate-300">
                <li><span className="font-bold text-slate-100">Plan Ahead:</span> Don't just chase the food. Think a few moves ahead to avoid trapping yourself, especially as you get longer.</li>
                <li><span className="font-bold text-slate-100">Quick Turns:</span> You can queue up your next turn before the snake has finished moving. Use this for sharp maneuvers in tight spots.</li>
                <li><span className="font-bold text-slate-100">Ladder Strategy:</span> A new ladder appears after reaching a certain score (changeable in settings!). Keep an eye on your score to anticipate its arrival.</li>
                <li><span className="font-bold text-slate-100">Master the Speed:</span> Feeling overwhelmed? Lower the speed in settings. Want a real challenge? Crank it up for a higher score potential!</li>
            </ul>
        </div>
      </div>

      <AdComponent />
    </div>
  );
};

export default StartScreen;
