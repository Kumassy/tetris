type Cell = {
  texture: any;
};
type Board = (Cell | null)[][];
type Cursor = {
  type: Tetrimion;
  pos: { x: number; y: number };
  rotation: number;
};
type Tetrimion = {
  texture: any;
  pos: { x: number; y: number }[];
};

const BOARD_WIDTH = 200;
const BOARD_HEIGHT = 400;
const CELL_WIDTH = 10;
const CELL_HEIGHT = 20;
const BOUNDARY_THICK = 10;
const INFO_WIDTH = 60;
const CANVAS_WIDTH = BOARD_WIDTH + BOUNDARY_THICK + INFO_WIDTH;
const CANVAS_HEIGHT = 400;

export {
  Cell,
  Board,
  Cursor,
  Tetrimion,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  CELL_WIDTH,
  CELL_HEIGHT,
  BOUNDARY_THICK,
  INFO_WIDTH,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
};
