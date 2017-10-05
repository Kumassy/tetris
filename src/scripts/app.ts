import '../styles/base.scss';
import * as PIXI from 'pixi.js';
// import { Option, None } from "monapt";
import * as _ from 'underscore';

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

const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 400;
const CELL_WIDTH = 10;
const CELL_HEIGHT = 20;
const app = new PIXI.Application(CANVAS_WIDTH, CANVAS_HEIGHT, {
  backgroundColor: 0xeeeeee,
});
document.body.appendChild(app.view);

export function reduce(oldState: State, action: Action): State {
  if (action.type === 'next-tick') {
    const state = oldState;
    if (state.cursor) {
      const cursor = state.cursor;
      if (_.max(cursor.type.pos, (p) => p.y).y + cursor.pos.y < CELL_HEIGHT - 1) {
        state.cursor.pos.y += 1;
      } else {
        // put board
        cursor.type.pos.forEach((p) => {
          const x = p.x + cursor.pos.x;
          const y = p.y + cursor.pos.y;
          state.board[x][y] = {texture: cursor.type.texture};
        });

        // discard cursor
        state.cursor = null;
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
  } else if (action.type === 'keyup') {
    const state = oldState;
    if (state.cursor) {
      state.cursor.pos.x += action.data.diff;
    }
    return state;
  } else {
    return oldState;
  }
}
//
// function fromStatus(status: Status): any {
//   if (status === Status.On) {
//     return PIXI.Texture.fromImage('images/white.png');
//   } else {
//     return PIXI.Texture.fromImage('images/black.png');
//   }
// }
//
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
  //
  // for (let i = 0; i < size; i++) {
  //   for (let j = 0; j < size; j++) {
  //     const texture = fromStatus(state[i][j]);
  //     const sprite = new PIXI.Sprite(texture);
  //
  //     sprite.position.x = tileSize * j;
  //     sprite.position.y = tileSize * i;
  //     sprite.width = tileSize;
  //     sprite.height = tileSize;
  //
  //     sprite.interactive = true;
  //     sprite.buttonMode = true;
  //     sprite.on('pointerdown', () =>
  //       dispatcher({ type: 'click', data: { x: i, y: j } })
  //     );
  //
  //     app.stage.addChild(sprite);
  //   }
  // }
}
//
function dispatcher(action: Action) {
  const state = stateStore.state;

  const nextState = reduce(state, action);
  render(nextState);
  stateStore.state = nextState;

  if (nextState.cursor == null) {
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
  }
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
document.addEventListener('keyup', (e) => {
  if (e.keyCode === 37) {
    // left arrow
    dispatcher({ type: 'keyup' , data: { diff: -1 }})
  } else if (e.keyCode === 39) {
    // right arrow
    dispatcher({ type: 'keyup' , data: { diff: 1 }})
  }
})
