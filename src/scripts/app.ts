import '../styles/base.scss';
import { Action } from './actions';
import {
  Tetrimion,
  Board,
  CELL_WIDTH,
  CELL_HEIGHT,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BOUNDARY_THICK,
  INFO_WIDTH,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from './constants';
import { TETRIMINOS, rotateMino } from './mino';
import { reducer } from './reducer';
import { State, getInitialState } from './store';

import * as PIXI from 'pixi.js';
// import { Option, Some, None } from "monapt";
import * as _ from 'underscore';
import * as Rx from 'rxjs/Rx';
import { Map, Record, fromJS } from 'immutable';
import { createStore } from 'redux';

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

/////////////////
// main

// app.ticker.add((delta) => {
//   //
// });

const store = createStore(reducer, getInitialState());
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

// export { _deleteLines, rotateMino, Tetrimion, Board, Cell };
