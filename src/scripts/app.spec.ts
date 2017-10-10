import { _deleteLines, Board, Cell, rotateMino, Tetrimion, } from './app';
import * as _ from 'underscore';

function t(): {texture: string} {
  return {texture: 'dummy-texture'}
}

describe('deleteLines', () => {
  it('should return the same board if cannot pop lines', () => {
    // transpose array
    // https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
    const board = _.zip.apply(_,[
      [t(), null, t()],
      [null, null, t()],
      [t(), t(), null],
    ]);
    const expected = _.zip.apply(_,[
      [t(), null, t()],
      [null, null, t()],
      [t(), t(), null],
    ]);
    const deleted = _deleteLines(board, 3, 3);
    expect(deleted).toEqual(expected);
  });
  it('should delete filled line', () => {
    const board = _.zip.apply(_,[
      [t(), t(), t()],
      [null, null, t()],
      [t(), t(), null],
    ]);
    const expected = _.zip.apply(_,[
      [null, null, null],
      [null, null, t()],
      [t(), t(), null],
    ]);
    const deleted = _deleteLines(board, 3, 3);
    expect(deleted).toEqual(expected);
  });
  it('should delete filled line and drop the line', () => {
    const board = _.zip.apply(_,[
      [t(), null, t()],
      [null, null, t()],
      [t(), t(), t()],
    ]);
    const expected = _.zip.apply(_,[
      [null, null, null],
      [t(), null, t()],
      [null, null, t()],
    ]);
    const deleted = _deleteLines(board, 3, 3);
    expect(deleted).toEqual(expected);
  });
  it('should delete two lines', () => {
    const board = _.zip.apply(_,[
      [t(), t(), t()],
      [t(), t(), t()],
      [t(), null, t()],
    ]);
    const expected = _.zip.apply(_,[
      [null, null, null],
      [null, null, null],
      [t(), null, t()],
    ]);
    const deleted = _deleteLines(board, 3, 3);
    expect(deleted).toEqual(expected);
  });
  it('should delete "tetris"', () => {
    const board = _.zip.apply(_,[
      [t(), null, t(), null],
      [t(), t(), t(), t()],
      [t(), t(), t(), t()],
      [t(), t(), t(), t()],
      [t(), t(), t(), t()],
    ]);
    const expected = _.zip.apply(_,[
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [t(), null, t(), null],
    ]);
    const deleted = _deleteLines(board, 4, 5);
    expect(deleted).toEqual(expected);
  });
});

describe('rotateMino', () => {
  let Lmino: Tetrimion;
  beforeEach(() => {
    // 1
    // 1
    // 1 1
    Lmino = {
      texture: 'dummy-texture',
      pos: [
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 0, y: 2},
        {x: 1, y: 2}
      ]
    };
  });

  it('should return the same mino for 1 turn', () => {
    expect(rotateMino(Lmino, 0)).toEqual(Lmino);
    expect(rotateMino(Lmino, 4)).toEqual(Lmino);
    expect(rotateMino(Lmino, -4)).toEqual(Lmino);
  });

  it('should rotate +1 (clockwise)', () => {
    // 1 1 1
    // 1
    const mino = {
      texture: 'dummy-texture',
      pos: [
        {x: 0, y: 0},
        {x: -1, y: 0},
        {x: -2, y: 0},
        {x: -2, y: 1}
      ]
    }
    expect(rotateMino(Lmino, 1)).toEqual(mino);
  });

  it('should rotate -1 (counter-clockwise)', () => {
    //     1
    // 1 1 1
    const mino = {
      texture: 'dummy-texture',
      pos: [
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 2, y: -1}
      ]
    }
    expect(rotateMino(Lmino, -1)).toEqual(mino);
  });

});
