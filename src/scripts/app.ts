import '../styles/base.scss';
import * as PIXI from 'pixi.js';

export type State = Status[][];
export enum Status {On, Off}

const CANVAS_SIZE = 600;
const app = new PIXI.Application(CANVAS_SIZE, CANVAS_SIZE, {backgroundColor: 0xeeeeee});
document.body.appendChild(app.view);

export function getInitialState(size: number): State {
  const state: State = [];
  for (let i = 0; i < size; i++) {
    state[i] = [];
    for (let j = 0; j < size; j++) {
      state[i][j] = Status.On;
    }
  }
  return state;
}

export function toggleStatus(status: Status): Status {
  if (status === Status.On) {
    return Status.Off;
  } else {
    return Status.On;
  }
}

export function nextState(oldState: State, x: number, y: number): State {
  const state: State = [];
  const size = oldState.length;

  for (let i = 0; i < size; i++) {
    state[i] = [];
    for (let j = 0; j < size; j++) {
      state[i][j] = oldState[i][j];
    }
  }

  state[x][y] = toggleStatus(oldState[x][y]);
  if (x - 1 >= 0) {
    state[x - 1][y] = toggleStatus(oldState[x - 1][y]);
  }
  if (x + 1 < size) {
    state[x + 1][y] = toggleStatus(oldState[x + 1][y]);
  }
  if (y - 1 >= 0) {
    state[x][y - 1] = toggleStatus(oldState[x][y - 1]);
  }
  if (y + 1 < size) {
    state[x][y + 1] = toggleStatus(oldState[x][y + 1]);
  }

  return state;
}

function fromStatus(status: Status): any {
  if (status == Status.On) {
    return PIXI.Texture.fromImage('images/white.png');
  } else {
    return PIXI.Texture.fromImage('images/black.png');
  }
}

function render(state: State) {
  const size = state.length;
  const tileSize = Math.floor(CANVAS_SIZE / size);
  app.stage.removeChildren();

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const texture = fromStatus(state[i][j]);
      const sprite = new PIXI.Sprite(texture);

      sprite.position.x = tileSize * j;
      sprite.position.y = tileSize * i;
      sprite.width = tileSize;
      sprite.height = tileSize;

      sprite.interactive = true;
      sprite.buttonMode = true;
      sprite.on('pointerdown', onClick(i, j));

      app.stage.addChild(sprite);
    }
  }
}

function onClick(x: number, y: number) {
  return function() {
    state = nextState(state, x, y);
    render(state);
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
let state = getInitialState(5);
render(state);
