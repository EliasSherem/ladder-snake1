import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GRID_SIZE, TICK_RATE_SLOW, TICK_RATE_NORMAL, TICK_RATE_FAST, TICK_RATE_IMPOSSIBLE } from '../constants';
import { type Coordinates, Direction, CellType, type Floor, type Ladder, type GameSpeed } from '../types';
import { useEventListener } from '../hooks/useEventListener';
import Cell from './Cell';
import { GoogleGenAI } from '@google/genai';
import { trackEvent } from '../analytics';

interface GameboardProps {
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  onGameOver: (score: number) => void;
  ladderThreshold: number;
  highScore: number;
  gameSpeed: GameSpeed;
  floorNames: Record<Floor, string>;
  setFloorNames: React.Dispatch<React.SetStateAction<Record<Floor, string>>>;
}

const Gameboard: React.FC<GameboardProps> = ({ score, setScore, onGameOver, ladderThreshold, highScore, gameSpeed, floorNames, setFloorNames }) => {
  const initialSnake = () => [{ x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) }];
  const [snake, setSnake] = useState<Coordinates[]>(initialSnake);
  const [ladders, setLadders] = useState<Ladder[]>([]);
  const [food, setFood] = useState<Coordinates>(() => getRandomCoordinates(initialSnake(), ladders));
  const [floor, setFloor] = useState<Floor>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isInGracePeriod, setIsInGracePeriod] = useState<boolean>(false);
  
  const gameLoopRef = useRef<number | null>(null);
  const gracePeriodTimeoutRef = useRef<number | null>(null);
  
  const directionRef = useRef<Direction>(Direction.RIGHT);
  const directionQueueRef = useRef<Direction[]>([]);
  const aiRef = useRef<GoogleGenAI | null>(null);

  useEffect(() => {
    // Assuming API_KEY is set in the environment as per guidelines
    if (process.env.API_KEY) {
      aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
  }, []);

  const generateFloorName = useCallback(async (currentFloor: Floor) => {
    if (!aiRef.current) return;
    setFloorNames(prev => ({ ...prev, [currentFloor]: 'Discovering...' }));

    try {
      const previousFloorName = floorNames[currentFloor - 1] || 'the beginning';
      const prompt = `You are a creative world-builder for a fantasy video game called 'Ladder Snake'. A player is climbing an infinite tower. Generate a cool, thematic name for floor number ${currentFloor}. The previous floor was called "${previousFloorName}". The name should be short, between 2 and 4 words. Do not include the floor number or any quotes in your response. Just the name.`;
      
      const response = await aiRef.current.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const newName = response.text.trim();
      setFloorNames(prev => ({ ...prev, [currentFloor]: newName }));
    } catch (error) {
      console.error("Error generating floor name:", error);
      setFloorNames(prev => ({ ...prev, [currentFloor]: `Floor ${currentFloor}` }));
    }
  }, [floorNames, setFloorNames]);

  useEffect(() => {
    if (!floorNames[floor] && floor > 1) {
      generateFloorName(floor);
    }
  }, [floor, floorNames, generateFloorName]);

  function getRandomCoordinates(snakeBody: Coordinates[], currentLadders: Ladder[]): Coordinates {
    let newPos: Coordinates;
    const ladderPositions = currentLadders.map(l => l.pos);
    const exclude = [...snakeBody, ...ladderPositions];
    do {
      newPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (exclude.some(segment => segment.x === newPos.x && segment.y === newPos.y));
    return newPos;
  }
  
  const queueDirection = useCallback((direction: Direction) => {
    // Limit the queue to 2 inputs to feel responsive but not laggy.
    if (directionQueueRef.current.length < 2) {
      const lastQueued = directionQueueRef.current[directionQueueRef.current.length - 1];
      // Don't add the same direction twice in a row.
      if (lastQueued !== direction) {
        directionQueueRef.current.push(direction);
      }
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const keyMap: Record<string, Direction> = {
      ArrowUp: Direction.UP,
      ArrowDown: Direction.DOWN,
      ArrowLeft: Direction.LEFT,
      ArrowRight: Direction.RIGHT,
    };
    const newDirection = keyMap[e.key];

    if (newDirection !== undefined) {
        e.preventDefault();
        queueDirection(newDirection);
    } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(p => !p);
    }
  }, [queueDirection]);

  useEventListener('keydown', handleKeyDown);

  const gameTick = useCallback(() => {
    if (isPaused) return;

    const isOpposite = (dir1: Direction, dir2: Direction) => {
        return (dir1 === Direction.UP && dir2 === Direction.DOWN) ||
               (dir1 === Direction.DOWN && dir2 === Direction.UP) ||
               (dir1 === Direction.LEFT && dir2 === Direction.RIGHT) ||
               (dir1 === Direction.RIGHT && dir2 === Direction.LEFT);
    }

    // Process the direction queue to find the next valid move
    while (directionQueueRef.current.length > 0) {
      const nextDirection = directionQueueRef.current[0];
      if (!isOpposite(directionRef.current, nextDirection)) {
        directionRef.current = nextDirection;
        directionQueueRef.current.shift(); // Consume the valid direction
        break; // Direction for this tick is set
      } else {
        // This move is invalid (e.g., reverse), so discard it and check the next one
        directionQueueRef.current.shift();
      }
    }

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      let head = { ...newSnake[0] };

      switch (directionRef.current) {
        case Direction.UP: head.y -= 1; break;
        case Direction.DOWN: head.y += 1; break;
        case Direction.LEFT: head.x -= 1; break;
        case Direction.RIGHT: head.x += 1; break;
      }
      
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        if (!isInGracePeriod) {
          setIsInGracePeriod(true);
          gracePeriodTimeoutRef.current = window.setTimeout(() => {
            onGameOver(score);
          }, 500);
        }
        return prevSnake;
      }

      if (isInGracePeriod) {
        setIsInGracePeriod(false);
        if (gracePeriodTimeoutRef.current) {
          clearTimeout(gracePeriodTimeoutRef.current);
          gracePeriodTimeoutRef.current = null;
        }
      }

      for (let i = 1; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
          onGameOver(score);
          return prevSnake;
        }
      }
      
      const ladder = ladders.find(l => 
        l.pos.x === head.x && 
        l.pos.y === head.y &&
        l.floors.includes(floor)
      );

      if (ladder) {
          const destinationFloor = ladder.floors.find(f => f !== floor)!;
          trackEvent('climb_ladder', { to_floor: destinationFloor });
          setFloor(destinationFloor);
          
          const newSnakeOnNewFloor = [{ x: head.x, y: head.y }];
          for (let i = 1; i < prevSnake.length; i++) {
              newSnakeOnNewFloor.push({ x: -1, y: -1 }); // Off-screen coordinates
          }
          
          setFood(getRandomCoordinates(newSnakeOnNewFloor, ladders));
          return newSnakeOnNewFloor;
      }
      
      newSnake.unshift(head);
      
      if (head.x === food.x && head.y === food.y) {
        const newScore = score + 1;
        setScore(newScore);

        const shouldGenerateLadder = ladderThreshold > 0 && newScore > 0 && newScore % ladderThreshold === 0;
        if (shouldGenerateLadder) {
            const nextFloor = floor + 1;
            const ladderExists = ladders.some(l => l.floors.includes(floor) && l.floors.includes(nextFloor));
            if (!ladderExists) {
                setLadders(prevLadders => {
                    const newLadderPos = getRandomCoordinates(newSnake, prevLadders);
                    const newLadder: Ladder = { pos: newLadderPos, floors: [floor, nextFloor] };
                    return [...prevLadders, newLadder];
                });
            }
        }
        
        setFood(getRandomCoordinates(newSnake, ladders));

      } else {
        newSnake.pop();
      }
      
      return newSnake;
    });
  }, [score, food, ladders, isPaused, floor, onGameOver, setScore, ladderThreshold, isInGracePeriod, setFloor, setFloorNames]);
  
  useEffect(() => {
    const getTickRate = (speed: GameSpeed) => {
      switch (speed) {
        case 'slow':
          return TICK_RATE_SLOW;
        case 'fast':
          return TICK_RATE_FAST;
        case 'impossible':
          return TICK_RATE_IMPOSSIBLE;
        case 'normal':
        default:
          return TICK_RATE_NORMAL;
      }
    };
    
    gameLoopRef.current = window.setInterval(gameTick, getTickRate(gameSpeed));
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameTick, gameSpeed]);

  useEffect(() => {
    return () => {
      if (gracePeriodTimeoutRef.current) {
        clearTimeout(gracePeriodTimeoutRef.current);
      }
    };
  }, []);

  const grid: CellType[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(CellType.EMPTY));

  snake.forEach((segment, index) => {
    if(segment.x >= 0 && segment.y >= 0) {
        grid[segment.y][segment.x] = index === 0 ? CellType.SNAKE_HEAD : CellType.SNAKE;
    }
  });
  if (food.x >= 0 && food.y >= 0 && food.x < GRID_SIZE && food.y < GRID_SIZE) {
      grid[food.y][food.x] = CellType.FOOD;
  }
  
  ladders.forEach(ladder => {
    if (ladder.floors.includes(floor)) {
        if (grid[ladder.pos.y] && grid[ladder.pos.y][ladder.pos.x] !== undefined) {
          grid[ladder.pos.y][ladder.pos.x] = CellType.LADDER;
        }
    }
  });

  const getFloorBgStyle = (currentFloor: Floor): React.CSSProperties => {
    const hue = ((currentFloor - 1) * 40) % 360;
    // Use HSL for a dynamic background color that changes with each floor.
    return { backgroundColor: `hsl(${hue}, 50%, 20%)` };
  };

  const floorText = floorNames[floor] || `Floor ${floor}`;
  
  const gracePeriodClass = isInGracePeriod 
    ? 'border-rose-500 animate-pulse' 
    : 'border-transparent';
  
  const getNextLadderDisplay = () => {
    const nextFloor = floor + 1;
    const ladderExists = ladders.some(l => l.floors.includes(floor) && l.floors.includes(nextFloor));
    if (ladderExists) {
        return <span className="text-amber-400">Spawned</span>;
    }

    if (ladderThreshold <= 0) {
      return <span className="text-amber-400">∞</span>;
    }
    const nextScore = (Math.floor(score / ladderThreshold) + 1) * ladderThreshold;
    return <span className="text-amber-400">{nextScore}</span>;
  };


  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-2 px-2 text-xl max-w-[85vmin]">
        <div className="font-bold">
          Score: <span className="text-emerald-400">{score}</span>
          {highScore > 0 && <span className="text-slate-400 ml-4">High: {highScore}</span>}
        </div>
        <div className="font-semibold text-slate-300">{floorText}</div>
        <div className="font-bold">Next Ladder: {getNextLadderDisplay()}</div>
      </div>
      <div 
        className={`grid gap-0.5 p-2 rounded-md shadow-2xl w-[85vmin] h-[85vmin] border-4 ${gracePeriodClass} transition-colors duration-500`}
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          ...getFloorBgStyle(floor),
        }}
      >
        {grid.map((row, y) =>
          row.map((cellType, x) => (
            <Cell 
                key={`${x}-${y}`} 
                type={cellType} 
                floor={floor}
            />
          ))
        )}
      </div>
       <div className="mt-4 text-slate-400 text-center">
        Press <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">SPACE</kbd> to pause/resume.
      </div>
      {/* Mobile Controls */}
      <div className="w-48 h-48 grid grid-cols-3 grid-rows-3 gap-2 mt-6 md:hidden">
        <button
          onTouchStart={(e) => { e.preventDefault(); queueDirection(Direction.UP); }}
          onClick={(e) => { e.preventDefault(); queueDirection(Direction.UP); }}
          className="col-start-2 row-start-1 bg-slate-700 rounded-lg flex items-center justify-center active:bg-slate-600 active:scale-95 transform transition-transform focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Move up"
        >
          <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); queueDirection(Direction.LEFT); }}
          onClick={(e) => { e.preventDefault(); queueDirection(Direction.LEFT); }}
          className="col-start-1 row-start-2 bg-slate-700 rounded-lg flex items-center justify-center active:bg-slate-600 active:scale-95 transform transition-transform focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Move left"
        >
          <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); queueDirection(Direction.RIGHT); }}
          onClick={(e) => { e.preventDefault(); queueDirection(Direction.RIGHT); }}
          className="col-start-3 row-start-2 bg-slate-700 rounded-lg flex items-center justify-center active:bg-slate-600 active:scale-95 transform transition-transform focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Move right"
        >
          <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); queueDirection(Direction.DOWN); }}
          onClick={(e) => { e.preventDefault(); queueDirection(Direction.DOWN); }}
          className="col-start-2 row-start-3 bg-slate-700 rounded-lg flex items-center justify-center active:bg-slate-600 active:scale-95 transform transition-transform focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Move down"
        >
          <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
    </div>
  );
};

export default Gameboard;