import '../styles/base.scss';
import * as PIXI from 'pixi.js';

export type State = Status[][];
export enum Status {On, Off}

const CANVAS_SIZE = 600;
const app = new PIXI.Application(CANVAS_SIZE, CANVAS_SIZE, {backgroundColor: 0xeeeeee});
document.body.appendChild(app.view);

interface IAction {
  type: string,
  data: any,
}

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

export function reduce(oldState: State, action: IAction): State {
  if (action.type === 'click') {
    const state: State = [];
    const size = oldState.length;
    const x = action.data.x;
    const y = action.data.y;

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
  } else if (action.type === 'initialize'){
    return getInitialState(5);
  } else {
    return oldState;
  }
}

function fromStatus(status: Status): any {
  if (status === Status.On) {
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
      sprite.on('pointerdown', () => dispatcher({type: 'click', data: {x: i, y: j}}));

      app.stage.addChild(sprite);
    }
  }
}

function dispatcher(action: IAction) {
  const state = stateStore.state;
  const nextState = reduce(state, action);
  render(nextState);
  stateStore.state = nextState;
}

// app.ticker.add((delta) => {
//   //
// });


// let state: State = [
//   [Status.On, Status.On, Status.On],
//   [Status.On, Status.Off, Status.On],
//   [Status.On, Status.On, Status.Off]
// ];

const stateStore: any = {};
dispatcher({type: 'initialize', data: {}});
