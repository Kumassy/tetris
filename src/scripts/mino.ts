import { Tetrimion, Board, CELL_WIDTH, CELL_HEIGHT } from './constants';

const TETRIMINOS: Tetrimion[] = [
  // 1
  // 1
  // 1 1
  {
    texture: PIXI.Texture.fromImage('images/white.png'),
    pos: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  },
  // 1 1
  // 1 1
  {
    texture: PIXI.Texture.fromImage('images/white.png'),
    pos: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }],
  },
  //   1
  // 1 1 1
  {
    texture: PIXI.Texture.fromImage('images/white.png'),
    pos: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
  },
  // 1
  // 1
  // 1
  // 1
  {
    texture: PIXI.Texture.fromImage('images/white.png'),
    pos: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }],
  },
];

function _deleteLines(
  oldBoard: Board,
  boardWidth: number,
  boardHeight: number
): Board {
  const board = oldBoard;
  let deletedLineCount = 0;

  for (let y = boardHeight - 1; y >= 0; y--) {
    while (1) {
      let filled = true;
      for (let x = 0; x < boardWidth; x++) {
        filled = filled && board[x][y] != null;
      }

      // delete line
      if (filled) {
        for (let j = y; j >= 0; j--) {
          for (let i = 0; i < boardWidth; i++) {
            if (j === 0) {
              board[i][j] = null;
            } else {
              board[i][j] = board[i][j - 1];
            }
          }
        }
        deletedLineCount++;
        // y++;  // examine deleted line again
      } else {
        break;
      }
    }
  }

  // cannot use this unless transposing board array
  // const filledCount = (row: (Cell | null)[]) => row.filter(r => r != null).length;
  //
  // const board = oldBoard.filter((row) => filledCount(row) < boardWidth);
  //
  // while(board.length < oldBoard.length) {
  //   const row = [];
  //   while(row.length < boardWidth) row.push(null);
  //
  //   board.unshift(row);
  // }

  return board;
}

function deleteLines(oldBoard: Board): Board {
  return _deleteLines(oldBoard, CELL_WIDTH, CELL_HEIGHT);
}

function rotateMino(mino: Tetrimion, direction: number): Tetrimion {
  // x' = x \cos\alpha - y \sin\alpha
  // y' = y \cos\alpha + x \sin\alpha
  const myCos = (direction: number) => {
    const dir = (direction % 4 + 4) % 4;
    if (dir === 1 || dir === 3) {
      return 0;
    } else if (dir === 0) {
      // cos(0)
      return 1;
    } else if (dir === 2) {
      // cos(180)
      return -1;
    } else {
      console.error('unexpected direction');
      return 0;
    }
  };
  const mySin = (direction: number) => {
    const dir = (direction % 4 + 4) % 4;
    if (dir === 0 || dir === 2) {
      return 0;
    } else if (dir === 1) {
      // sin(90)
      return 1;
    } else if (dir === 3) {
      // sin(-90)
      return -1;
    } else {
      console.error('unexpected direction');
      return 0;
    }
  };
  const pos = mino.pos.map(p => {
    return {
      x: p.x * myCos(direction) - p.y * mySin(direction),
      y: p.x * mySin(direction) + p.y * myCos(direction),
    };
  });

  return {
    texture: mino.texture,
    pos: pos,
  };
}

export { TETRIMINOS, deleteLines, _deleteLines, rotateMino };
