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
// // // Opt-in to interactivity
// // bunny.interactive = true;
// // // Shows hand cursor
// // bunny.buttonMode = true;
// // bunny.on('pointerdown', onClick);
//
// stage.addChild(bunny);
// animate();
// // renderer.render(stage);
//
// function animate() {
//   requestAnimationFrame(animate);
//   // var bunny = stage.getChildAt(0);
//   // bunny.rotation += 0.01;
//   renderer.render(stage);
// }
//
//
// // function onClick() {
// //   var bunny = stage.getChildAt(0);
// //   bunny.scale.x *= 1.25;
// //   bunny.scale.y *= 1.25;
// //   console.log("hoge");
// // }

export type State = Status[][];
export enum Status {On, Off}

export function initialize(size: number): State {
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
    // return PIXI.Texture.fromImage('images/white.png');
    return PIXI.Texture.fromImage('images/dman.png');
  } else {
    return PIXI.Texture.fromImage('images/black.png');
  }
}

function render(state: State) {
  const size = state.length;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const texture = fromStatus(state[i][j]);
      const sprite = new PIXI.Sprite(texture);

      sprite.anchor.x = 0.5;
      sprite.anchor.y = 0.5;
      sprite.position.x = 64 * j;
      sprite.position.y = 64 * i;
      sprite.scale.x = 2;
      sprite.scale.y = 2;

      stage.addChild(sprite);
    }
  }
  // renderer.render(stage);
}

function animate() {
  requestAnimationFrame(animate);
  // var bunny = stage.getChildAt(0);
  // bunny.rotation += 0.01;
  renderer.render(stage);
}

// const stage = new PIXI.Container();
// let state: State;

const state: State = [
  [Status.On, Status.On, Status.On],
  [Status.On, Status.Off, Status.On],
  [Status.On, Status.On, Status.Off]
];
const stage = new PIXI.Container();
animate()
render(state);
// animate();

// const stage = new PIXI.Container();
// const sprite = PIXI.Sprite.fromImage('images/dman.png');
//
// sprite.anchor.x = 0.5;
// sprite.anchor.y = 0.5;
// sprite.position.x = 400;
// sprite.position.y = 300;
// sprite.scale.x = 2;
// sprite.scale.y = 2;
//
//
// stage.addChild(sprite);
// renderer.render(stage);
