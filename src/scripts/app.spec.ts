import * as App from './app'

describe('toggleStatus', () => {
  it('should toggle status', () => {
    expect(App.toggleStatus(App.Status.On)).toBe(App.Status.Off);
    expect(App.toggleStatus(App.Status.Off)).toBe(App.Status.On);
  });
});

describe('nextState', () => {
  // o x o
  // x x x
  // o x o
  let state: App.State;
  beforeEach(() => {
    state = App.getInitialState(3);
  });

  it('should toggle 4 lights', () => {
    state = App.nextState(state, 1, 1);
    expect(state).toEqual([
      [App.Status.On, App.Status.Off, App.Status.On],
      [App.Status.Off, App.Status.Off, App.Status.Off],
      [App.Status.On, App.Status.Off, App.Status.On]
    ]);
  });
  it('should toggle 3 lights', () => {
    state = App.nextState(state, 1, 0);
    expect(state).toEqual([
      [App.Status.Off, App.Status.On, App.Status.On],
      [App.Status.Off, App.Status.Off, App.Status.On],
      [App.Status.Off, App.Status.On, App.Status.On]
    ]);
  });
  it('should handle corner lights', () => {
    state = App.nextState(state, 2, 2);
    expect(state.length).toBe(3);
    expect(state).toEqual([
      [App.Status.On, App.Status.On, App.Status.On],
      [App.Status.On, App.Status.On, App.Status.Off],
      [App.Status.On, App.Status.Off, App.Status.Off]
    ]);
  });
});
