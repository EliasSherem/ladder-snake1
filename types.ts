export type Coordinates = {
  x: number;
  y: number;
};

export enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

export enum CellType {
  EMPTY,
  SNAKE,
  SNAKE_HEAD,
  FOOD,
  LADDER,
}

export type GameState = 'idle' | 'playing' | 'gameOver';

export type Floor = number;

export type Ladder = {
  pos: Coordinates;
  floors: [number, number];
};

export type GameSpeed = 'slow' | 'normal' | 'fast' | 'impossible';