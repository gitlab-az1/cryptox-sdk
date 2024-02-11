import { EventEmitter } from './events';


describe('_internal/resources/events', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('should be able to listen to an event', () => {
    const emitter = new EventEmitter();
    const listener = jest.fn();

    emitter.subscribe('test', listener);
    emitter.emit('test', null);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('should be able to listen an event once', () => {
    const emitter = new EventEmitter();

    let nonOnceCalls = 0;
    let onceCalls = 0;

    const nonOnceListener = () => {
      nonOnceCalls++;
    };

    const listener = () => {
      onceCalls++;
    };

    emitter.subscribe('test', nonOnceListener);
    emitter.subscribe('test', listener, undefined, { once: true });
    
    emitter.fire('test', null);
    emitter.fire('test', null);
    emitter.fire('test', null);

    expect(nonOnceCalls).toBe(3);
    expect(onceCalls).toBe(1);
  });
});
