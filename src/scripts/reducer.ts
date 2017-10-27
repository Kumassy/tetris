import { State } from './store';
import { Action } from './actions';
import {
  Cursor,
  CELL_WIDTH,
  CELL_HEIGHT,
  BOUNDARY_THICK,
  INFO_WIDTH,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from './constants';
import { deleteLines, rotateMino } from './mino';

import * as _ from 'underscore';

function reducer(state: State, action: Action): State {
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

      // // var explosion = new PIXI.extras.AnimatedSprite(explosionTextures);
      // var explosion = new PIXI.extras.AnimatedSprite(animations.attack);
      //
      // explosion.x = Math.random() * app.renderer.width;
      // explosion.y = Math.random() * app.renderer.height;
      // explosion.anchor.set(0.5);
      // // explosion.rotation = Math.random() * Math.PI;
      // explosion.scale.set(0.75 + Math.random() * 0.5);
      // explosion.loop = false;
      // explosion.gotoAndPlay(0);
      // explosion.onComplete = () => {
      //   app.stage.removeChild(explosion);
      // };
      // app.stage.addChild(explosion);

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
      st = reducer(st, { type: 'next-tick' });
    }
    return st;
  } else {
    return state;
  }
}

export { reducer };
