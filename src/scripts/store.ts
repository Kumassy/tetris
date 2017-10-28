import { TETRIMINOS } from './mino';
import { Tetrimion, CELL_WIDTH, CELL_HEIGHT } from './constants';

import { Record, fromJS } from 'immutable';
import * as _ from 'underscore';
import * as PIXI from 'pixi.js';

type Cell = {
  texture: any;
};
type Board = (Cell | null)[][];
type Cursor = {
  type: Tetrimion;
  pos: { x: number; y: number };
  rotation: number;
};

// https://journal.artfuldev.com/making-immutablejs-work-with-the-advantages-of-typescript-e2a7781a6f77
interface IState {
  board: Board;
  cursor: Cursor | null;
  nextmino: Tetrimion[];
  animations: PIXI.extras.AnimatedSprite[];
}
const StateRecord = Record({
  board: undefined,
  cursor: undefined,
  nextmino: [],
  animations: []
});
class State extends StateRecord implements IState {
  board: Board;
  cursor: Cursor | null;
  nextmino: Tetrimion[];
  animations: PIXI.extras.AnimatedSprite[];

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
    animations: []
  });
  return state;
}

export { State, getInitialState };
