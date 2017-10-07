import '../styles/base.scss';
import * as PIXI from 'pixi.js';
// import { Option, None } from "monapt";
import * as _ from 'underscore';
import * as Rx from 'rxjs/Rx';

// TODO: Immutable.js

type Cell = {
  texture: any;
}
type Board = (Cell | null)[][];

type State = {
  board: Board;
  cursor?: {
    type: Tetrimion;
    pos: {x: number; y: number};
    rotation: number;
  } | null
};

type StateStore = {
  state: State | null
}

type Action = {
  type: string,
  data?: any;
};

type Tetrimion = {
  texture: any;
  pos: [{x: number; y: number}];
};

const TETRIMINOS: Tetrimion[] = [
  // 1
  // 1
  // 1 1
  {
    texture: PIXI.Texture.fromImage('images/white.png'),
    pos: [
      {x: 0, y: 0},
      {x: 0, y: 1},
      {x: 0, y: 2},
      {x: 1, y: 2}
    ]
  },
  // 1 1
  // 1 1
  {
    texture: PIXI.Texture.fromImage('images/white.png'),
    pos: [
      {x: 0, y: 0},
      {x: 0, y: 1},
      {x: 1, y: 0},
      {x: 1, y: 1}
    ]
  },
  //   1
  // 1 1 1
  {
    texture: PIXI.Texture.fromImage('images/white.png'),
    pos: [
      {x: 1, y: 0},
      {x: 0, y: 1},
      {x: 1, y: 1},
      {x: 2, y: 1}
    ]
  },
  // 1
  // 1
  // 1
  // 1
  {
    texture: PIXI.Texture.fromImage('images/white.png'),
    pos: [
      {x: 0, y: 0},
      {x: 0, y: 1},
      {x: 0, y: 2},
      {x: 0, y: 3},
    ]
  },
]

const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 400;
const CELL_WIDTH = 10;
const CELL_HEIGHT = 20;
const app = new PIXI.Application(CANVAS_WIDTH, CANVAS_HEIGHT, {
  backgroundColor: 0xeeeeee,
});
document.body.appendChild(app.view);

function reduce(oldState: State, action: Action): State {
  if (action.type === 'next-tick') {
    const state = oldState;
    if (state.cursor) {
      const cursor = state.cursor;
      const nextCursorPosY = cursor.pos.y + 1;

      const canMove = cursor.type.pos.every((p) => {
        const x = p.x + cursor.pos.x;
        const y = p.y + nextCursorPosY;
        return state.board[x][y] == null;
      }) && (_.max(cursor.type.pos, (p) => p.y).y + nextCursorPosY < CELL_HEIGHT);

      if (canMove) {
        state.cursor.pos.y = nextCursorPosY;
      } else {
        // put cursor to board
        cursor.type.pos.forEach((p) => {
          const x = p.x + cursor.pos.x;
          const y = p.y + cursor.pos.y;
          state.board[x][y] = {texture: cursor.type.texture};
        });
        state.cursor = null;

        // delete
        state.board = deleteLines(state.board);
      }
    }
    return state;
  } else if (action.type === 'initialize') {
    const board: Board = [];
    for (let i = 0; i < CELL_WIDTH; i++) {
      board[i] = []
      for (let j = 0; j < CELL_HEIGHT; j++) {
        board[i][j] = null;
      }
    }
    const state: State = {
      board: board
    };
    return state;
  } else if (action.type === 'set-cursor') {
    const state: State = {
      board: oldState.board,
      cursor: action.data.cursor
    }
    return state;
  } else if (action.type === 'next-cursor') {
    // TODO remove sample
    const mino: Tetrimion = _.sample(TETRIMINOS);
    const cursor = {
      type: mino,
      pos: {x: 0, y: 0},
      rotation: 0
    }
    const state: State = {
      board: oldState.board,
      cursor: cursor
    }
    return state;
  } else if (action.type === 'keyup') {
    const state = oldState;
    if (state.cursor) {
      const cursor = state.cursor;
      const nextCursorPosX = cursor.pos.x + action.data.diff;

      const canMove = cursor.type.pos.every((p) => {
        const x = p.x + nextCursorPosX;
        const y = p.y + cursor.pos.y;
        return (x >= 0 && x < CELL_WIDTH) && (y >= 0 && y < CELL_HEIGHT) && state.board[x][y] == null;
      }) && (_.min(cursor.type.pos, (p) => p.x).x + nextCursorPosX >= 0) && (_.max(cursor.type.pos, (p) => p.x).x + nextCursorPosX < CELL_WIDTH);

      if (canMove) {
        state.cursor.pos.x = nextCursorPosX;
      }
    }
    return state;
  } else {
    return oldState;
  }
}

function render(state: State) {
  app.stage.removeChildren();

  const tileSize = Math.floor(CANVAS_WIDTH / CELL_WIDTH);

  for (let i = 0; i < CELL_WIDTH; i++) {
    for (let j = 0; j < CELL_HEIGHT; j++) {
      if (state.board[i][j]) {
        const sprite = new PIXI.Sprite(state.board[i][j]!.texture);
        sprite.position.x = tileSize * i;
        sprite.position.y = tileSize * j;
        sprite.width = tileSize;
        sprite.height = tileSize;
        app.stage.addChild(sprite);
      }
    }
  }

  if (state.cursor) {
    const tetrimion = state.cursor.type;
    const cursorPos = state.cursor.pos;
    const cursorRot = state.cursor.rotation;

    const texture = tetrimion.texture;
    tetrimion.pos.forEach((p) => {
      const sprite = new PIXI.Sprite(texture);
      sprite.position.x = tileSize * (cursorPos.x + p.x);
      sprite.position.y = tileSize * (cursorPos.y + p.y);
      sprite.width = tileSize;
      sprite.height = tileSize;
      app.stage.addChild(sprite);
    });
  }
}

function dispatcher(action: Action) {
  const state = stateStore.state;

  const nextState = reduce(state, action);
  render(nextState);
  stateStore.state = nextState;

  if (nextState.cursor == null) {
    dispatcher({ type: 'next-cursor' });
  }
}

function _deleteLines(oldBoard: Board, boardWidth: number, boardHeight: number): Board {
  const board = oldBoard;
  let deletedLineCount = 0;

  for (let y = boardHeight - 1; y >= 0; y--) {
    let filled = true;
    for (let x = 0; x < boardWidth; x++) {
      filled = filled && (board[x][y] != null);
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
    }
  }
  return board;
}

function deleteLines(oldBoard: Board): Board {
  return _deleteLines(oldBoard, CELL_WIDTH, CELL_HEIGHT);
}

// app.ticker.add((delta) => {
//   //
// });

// let state: State = [
//   [Status.On, Status.On, Status.On],
//   [Status.On, Status.Off, Status.On],
//   [Status.On, Status.On, Status.Off]
// ];

const stateStore: any = {
  state: null
};
dispatcher({ type: 'initialize' });


// 1
// 1
// 1 1
const mymino: Tetrimion = {
  texture: PIXI.Texture.fromImage('images/white.png'),
  pos: [
    {x: 0, y: 0},
    {x: 0, y: 1},
    {x: 0, y: 2},
    {x: 1, y: 2}
  ]
};
const cursor = {
  type: mymino,
  pos: {x: 0, y: 0},
  rotation: 0
}
dispatcher({ type: 'set-cursor', data: { cursor: cursor }});



setInterval(() => {
  dispatcher({type: 'next-tick'})}
, 500);


Rx.Observable.fromEvent(document, 'keyup')
  .filter((e: any) => e.keyCode === 37)  // left arrow
  .subscribe(() => dispatcher({ type: 'keyup' , data: { diff: -1 }}));
Rx.Observable.fromEvent(document, 'keyup')
  .filter((e: any) => e.keyCode === 39)  // right arrow
  .subscribe(() => dispatcher({ type: 'keyup' , data: { diff: 1 }}));

Rx.Observable.fromEvent(document, 'keydown')
  .filter((e: any) => e.keyCode === 40)
  .throttleTime(70)
  .subscribe(() => dispatcher({ type: 'next-tick' }));

export {_deleteLines, Board, Cell}
