import { _deleteLines, Board, Cell } from './app';
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
    console.log(deleted);
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
    console.log(deleted);
  });
});
