import '../styles/base.scss';

// import { Greeter } from './greeter';
//
// const greeter: Greeter = new Greeter('tetris');
//
// const el = document.getElementById('greeting');
// if (el) {
//   el.innerHTML = greeter.greet();
// }


import * as PIXI from 'pixi.js';

const renderer = PIXI.autoDetectRenderer(600, 600, {backgroundColor: 0xeeeeee});
document.body.appendChild(renderer.view);

// var stage = new PIXI.Container();
// var texture = PIXI.Texture.fromImage('images/dman.png');
// var bunny = new PIXI.Sprite(texture);
// bunny.anchor.x = 0.5;
// bunny.anchor.y = 0.5;
// bunny.position.x = 400;
// bunny.position.y = 300;
// bunny.scale.x = 2;
// bunny.scale.y = 2;
//
// // Opt-in to interactivity
// bunny.interactive = true;
// // Shows hand cursor
// bunny.buttonMode = true;
// bunny.on('pointerdown', onClick);
//
// stage.addChild(bunny);
// animate();
//
// function animate() {
//   requestAnimationFrame(animate);
//   var bunny = stage.getChildAt(0);
//   bunny.rotation += 0.01;
//   renderer.render(stage);
// }
//
// function onClick() {
//   var bunny = stage.getChildAt(0);
//   bunny.scale.x *= 1.25;
//   bunny.scale.y *= 1.25;
//   console.log("hoge");
// }

export type State = Status[][];
export enum Status {On, Off}

export function initialize(size: number): State {
  let state: State = [];
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
  let state: State = [];
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

const stage = new PIXI.Container();
let state: State;
