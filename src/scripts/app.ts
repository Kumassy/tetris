import '../styles/base.scss';
import * as PIXI from 'pixi.js';
// import { Option, Some, None } from "monapt";
import * as _ from 'underscore';
import * as Rx from 'rxjs/Rx';
import { Map, Record, fromJS } from 'immutable';
import { createStore } from 'redux';

type Cell = {
  texture: any;
};
type Board = (Cell | null)[][];
type Cursor = {
  type: Tetrimion;
  pos: { x: number; y: number };
  rotation: number;
};

// type State = {
//   board: Board;
//   cursor?: {
//     type: Tetrimion;
//     pos: {x: number; y: number};
//     rotation: number;
//   } | null
// };

// https://journal.artfuldev.com/making-immutablejs-work-with-the-advantages-of-typescript-e2a7781a6f77
interface IState {
  board: Board;
  cursor: Cursor | null;
  nextmino: Tetrimion[];
}
const StateRecord = Record({
  board: undefined,
  cursor: undefined,
  nextmino: [],
});
class State extends StateRecord implements IState {
  board: Board;
  cursor: Cursor | null;
  nextmino: Tetrimion[];

  constructor(props: IState) {
    super(fromJS(props));
  }

  set(key: any, value: any): State {
    return new State(super.set(key, value).toJS());
  }

  setIn(keyPath: any, value: any): State {
    return new State(super.setIn(keyPath, value).toJS());
  }
}

type Action = {
  type: string;
  data?: any;
};

type Tetrimion = {
  texture: any;
  pos: { x: number; y: number }[];
};

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

const BOARD_WIDTH = 200;
const BOARD_HEIGHT = 400;
const CELL_WIDTH = 10;
const CELL_HEIGHT = 20;
const BOUNDARY_THICK = 10;
const INFO_WIDTH = 60;
const CANVAS_WIDTH = BOARD_WIDTH + BOUNDARY_THICK + INFO_WIDTH;
const CANVAS_HEIGHT = 400;

const app: any = new PIXI.Application(CANVAS_WIDTH, CANVAS_HEIGHT, {
  backgroundColor: 0xeeeeee,
});
app.minoLayer = new PIXI.Container();
app.stage.addChild(app.minoLayer);
document.body.appendChild(app.view);

// let explosionTextures: PIXI.Texture[] = [];
// let fireTextures: PIXI.Texture[] = [];
type Animations = {
  explosion: PIXI.Texture[];
  fire: PIXI.Texture[];
  attack: PIXI.Texture[];
};
const animations: Animations = {
  explosion: [],
  fire: [],
  attack: [],
};

PIXI.loader
  .add('explosion', 'images/mc.json')
  .add('fire', 'assets/sprites/fire12.json')
  .add('attack', 'assets/sprites/shogeki25.json')
  .load((loader: any, resources: any) => {
    for (let i = 0; i < 26; i++) {
      let texture =
        resources.explosion.textures[
          'Explosion_Sequence_A ' + (i + 1) + '.png'
        ];
      animations.explosion.push(texture);
    }

    for (let i = 0; i < 20; i++) {
      let texture = resources.fire.textures['fire12-' + i + '.png'];
      animations.fire.push(texture);
    }

    for (let i = 0; i < 10; i++) {
      let texture = resources.attack.textures['shogeki25-' + i + '.png'];
      animations.attack.push(texture);
    }
  });

function reduce(state: State, action: Action): State {
  if (action.type === 'next-tick') {
    // const state = oldState;
    // let newState: State;
    if (state.get('cursor')) {
      const board = state.get('board').toJS();
      const cursor = state.get('cursor').toJS();
      const nextCursorPosY = cursor.pos.y + 1;
      const tetrimion = rotateMino(cursor.type, cursor.rotation);

      const canMove =
        tetrimion.pos.every(p => {
          const x = p.x + cursor.pos.x;
          const y = p.y + nextCursorPosY;
          return board[x][y] == null;
        }) && _.max(tetrimion.pos, p => p.y).y + nextCursorPosY < CELL_HEIGHT;

      if (canMove) {
        return state.setIn(['cursor', 'pos', 'y'], nextCursorPosY);
      }

      tetrimion.pos.forEach(p => {
        const x = p.x + cursor.pos.x;
        const y = p.y + cursor.pos.y;
        board[x][y] = { texture: tetrimion.texture };
      });

      const nextCursor: Cursor = {
        type: state.get('nextmino').get(0),
        pos: { x: 0, y: 0 },
        rotation: 0,
      };

      // TODO FIXME: This code violate referential transparency

      // var explosion = new PIXI.extras.AnimatedSprite(explosionTextures);
      var explosion = new PIXI.extras.AnimatedSprite(animations.attack);

      explosion.x = Math.random() * app.renderer.width;
      explosion.y = Math.random() * app.renderer.height;
      explosion.anchor.set(0.5);
      // explosion.rotation = Math.random() * Math.PI;
      explosion.scale.set(0.75 + Math.random() * 0.5);
      explosion.loop = false;
      explosion.gotoAndPlay(0);
      explosion.onComplete = () => {
        app.stage.removeChild(explosion);
      };
      app.stage.addChild(explosion);

      return state
        .set('cursor', nextCursor)
        .set('board', deleteLines(board))
        .set('nextmino', state.get('nextmino').slice(1));
    }
    return state;
  } else if (action.type === 'set-cursor') {
    return state.set('cursor', action.data.cursor);
  } else if (action.type === 'push-mino') {
    return state.set('nextmino', state.get('nextmino').push(action.data.mino));
  } else if (action.type === 'keyup') {
    // const state = oldState;
    if (state.get('cursor')) {
      const board = state.get('board').toJS();
      const cursor = state.get('cursor').toJS();
      const nextCursorPosX = cursor.pos.x + action.data.diff;
      const tetrimion = rotateMino(cursor.type, cursor.rotation);

      const canMove =
        tetrimion.pos.every(p => {
          const x = p.x + nextCursorPosX;
          const y = p.y + cursor.pos.y;
          return (
            x >= 0 &&
            x < CELL_WIDTH &&
            (y >= 0 && y < CELL_HEIGHT) &&
            board[x][y] == null
          );
        }) &&
        _.min(tetrimion.pos, p => p.x).x + nextCursorPosX >= 0 &&
        _.max(tetrimion.pos, p => p.x).x + nextCursorPosX < CELL_WIDTH;

      if (canMove) {
        return state.setIn(['cursor', 'pos', 'x'], nextCursorPosX);
      }
    }
    return state;
  } else if (action.type === 'rotate') {
    // const state = oldState;
    if (state.get('cursor')) {
      const board = state.get('board').toJS();
      const cursor = state.get('cursor').toJS();
      const nextRotation = cursor.rotation + action.data.direction;
      const tetrimion = rotateMino(cursor.type, nextRotation);

      const canRotate =
        tetrimion.pos.every(p => {
          const x = p.x + cursor.pos.x;
          const y = p.y + cursor.pos.y;
          return (
            x >= 0 &&
            x < CELL_WIDTH &&
            (y >= 0 && y < CELL_HEIGHT) &&
            board[x][y] == null
          );
        }) &&
        _.min(tetrimion.pos, p => p.x).x + cursor.pos.x >= 0 &&
        _.max(tetrimion.pos, p => p.x).x + cursor.pos.x < CELL_WIDTH;

      if (canRotate) {
        return state.setIn(['cursor', 'rotation'], nextRotation);
      }
    }
    return state;
  } else if (action.type === 'quick-drop') {
    let st = state;
    while (st.get('nextmino').size === 3) {
      st = reduce(st, { type: 'next-tick' });
    }
    return st;
  } else {
    return state;
  }
}

function render(state: State) {
  // app.stage.removeChildren();
  app.minoLayer.removeChildren();

  {
    const sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/black.png'));
    sprite.position.x = BOARD_WIDTH;
    sprite.position.y = 0;
    sprite.width = BOUNDARY_THICK;
    sprite.height = CANVAS_HEIGHT;
    // app.stage.addChild(sprite);
    app.minoLayer.addChild(sprite);
  }

  const tileSize = Math.floor(BOARD_HEIGHT / CELL_HEIGHT);
  const board = state.get('board').toJS();

  for (let i = 0; i < CELL_WIDTH; i++) {
    for (let j = 0; j < CELL_HEIGHT; j++) {
      if (board[i][j]) {
        const sprite = new PIXI.Sprite(board[i][j].texture);
        sprite.position.x = tileSize * i;
        sprite.position.y = tileSize * j;
        sprite.width = tileSize;
        sprite.height = tileSize;
        // app.stage.addChild(sprite);
        app.minoLayer.addChild(sprite);
      }
    }
  }

  if (state.get('cursor')) {
    const cursor = state.get('cursor').toJS();
    const tetrimion = cursor.type;
    const cursorPos = cursor.pos;
    const cursorRot = cursor.rotation;

    const texture = tetrimion.texture;
    rotateMino(tetrimion, cursorRot).pos.forEach(p => {
      const sprite = new PIXI.Sprite(texture);
      sprite.position.x = tileSize * (cursorPos.x + p.x);
      sprite.position.y = tileSize * (cursorPos.y + p.y);
      sprite.width = tileSize;
      sprite.height = tileSize;
      // app.stage.addChild(sprite);
      app.minoLayer.addChild(sprite);
    });
  }

  for (let i = 0; i < state.get('nextmino').size; i++) {
    const mino: Tetrimion = state.get('nextmino').toJS()[i];

    mino.pos.forEach(p => {
      const sprite = new PIXI.Sprite(mino.texture);
      sprite.position.x = tileSize * p.x + BOARD_WIDTH + BOUNDARY_THICK;
      sprite.position.y = tileSize * (p.y + i * 5);
      sprite.width = tileSize;
      sprite.height = tileSize;
      // app.stage.addChild(sprite);
      app.minoLayer.addChild(sprite);
    });
  }
}

function getInitialState(): State {
  const board: Board = [];
  for (let i = 0; i < CELL_WIDTH; i++) {
    board[i] = [];
    for (let j = 0; j < CELL_HEIGHT; j++) {
      board[i][j] = null;
    }
  }

  const cursor: Cursor = {
    type: _.sample(TETRIMINOS),
    pos: { x: 0, y: 0 },
    rotation: 0,
  };

  const state: State = new State({
    board: board,
    cursor: cursor,
    nextmino: [
      _.sample(TETRIMINOS),
      _.sample(TETRIMINOS),
      _.sample(TETRIMINOS),
    ],
  });
  return state;
}

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

/////////////////
// main

// app.ticker.add((delta) => {
//   //
// });

const store = createStore(reduce, getInitialState());
let unsubscribe = store.subscribe(() => {
  const state = store.getState();
  render(state);

  // if (state.cursor == null) {
  //   const cursor = {
  //     type: _.sample(TETRIMINOS),
  //     pos: {x: 0, y: 0},
  //     rotation: 0
  //   }
  //   store.dispatch({ type: 'set-cursor', data: { cursor: cursor }});
  // }
  console.log(state.get('nextmino').length);
  if (state.get('nextmino').size < 3) {
    store.dispatch({ type: 'push-mino', data: { mino: _.sample(TETRIMINOS) } });
  }
});

// 1
// 1
// 1 1
const mymino: Tetrimion = {
  texture: PIXI.Texture.fromImage('images/white.png'),
  pos: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
};
// const cursor = {
//   type: mymino,
//   pos: {x: 0, y: 0},
//   rotation: 0
// }
// store.dispatch({ type: 'set-cursor', data: { cursor: cursor }});

setInterval(() => {
  store.dispatch({ type: 'next-tick' });
}, 500);

Rx.Observable
  .fromEvent(document, 'keyup')
  .filter((e: any) => e.key === 'ArrowLeft') // left arrow
  .subscribe(() => store.dispatch({ type: 'keyup', data: { diff: -1 } }));
Rx.Observable
  .fromEvent(document, 'keyup')
  .filter((e: any) => e.key === 'ArrowRight') // right arrow
  .subscribe(() => store.dispatch({ type: 'keyup', data: { diff: 1 } }));

Rx.Observable
  .fromEvent(document, 'keyup')
  .filter((e: any) => e.key === 'a')
  .subscribe(() => store.dispatch({ type: 'rotate', data: { direction: -1 } }));
Rx.Observable
  .fromEvent(document, 'keyup')
  .filter((e: any) => e.key === 'd')
  .subscribe(() => store.dispatch({ type: 'rotate', data: { direction: 1 } }));

// soft drop
Rx.Observable
  .fromEvent(document, 'keydown')
  .filter((e: any) => e.key === 'ArrowDown') // down arrow
  .throttleTime(70)
  .subscribe(() => store.dispatch({ type: 'next-tick' }));
// quick drop
Rx.Observable
  .fromEvent(document, 'keydown')
  .filter((e: any) => e.key === 'ArrowUp')
  .subscribe(() => store.dispatch({ type: 'quick-drop' }));

export { _deleteLines, rotateMino, Tetrimion, Board, Cell };
