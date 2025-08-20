import React from 'react';
import { CellType, type Floor } from '../types';

interface CellProps {
  type: CellType;
  floor: Floor;
}

const Cell: React.FC<CellProps> = React.memo(({ type, floor }) => {
  const baseClass = 'w-full h-full rounded-sm transition-colors duration-200';
  let className: string;
  let style: React.CSSProperties = {};

  switch (type) {
    case CellType.SNAKE_HEAD:
      className = `${baseClass} bg-emerald-400 shadow-lg shadow-emerald-400/50`;
      break;
    case CellType.SNAKE:
      className = `${baseClass} bg-emerald-600`;
      break;
    case CellType.FOOD:
      className = `${baseClass} bg-rose-500 shadow-lg shadow-rose-500/50`;
      break;
    case CellType.LADDER:
      className = `${baseClass} bg-amber-500 flex items-center justify-around py-0.5 animate-pulse`;
      break;
    case CellType.EMPTY:
    default:
      const hue = ((floor - 1) * 40) % 360;
      className = baseClass;
      // Using HSL allows for a dynamic, cycling color scheme for infinite floors.
      // The background is slightly lighter than the gameboard background.
      style = { backgroundColor: `hsl(${hue} 40% 35% / 0.5)` };
  }

  return (
    <div className={className} style={style}>
      {type === CellType.LADDER && <div className="w-1/2 h-full bg-slate-800/50"></div>}
    </div>
  );
});

export default Cell;