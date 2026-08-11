import {ws} from 'msw';
import {setupServer} from 'msw/node';
import {streaming} from '../streaming';

const live = ws.link('ws://sand.test/live');
const server = setupServer();

describe('streaming', () => {
  const explain = (thrown: unknown) => `socket: ${thrown}`;

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const opened = (stream: {onOpen: (greet: (socket: WebSocket) => void) => unknown}) =>
    new Promise<WebSocket>(resolve => stream.onOpen(resolve));

  test('the open socket comes back whole to the greeting', async () => {
    server.use(live.addEventListener('connection', () => {}));

    const stream = streaming('ws://sand.test/live', explain);
    const socket = await opened(stream);

    expect(socket.readyState).toBe(WebSocket.OPEN);
    stream.close();
  });

  test('every frame reaches the receiver, raw', async () => {
    server.use(live.addEventListener('connection', ({client}) => {
      client.send('first');
      client.send('second');
    }));

    const frames: string[] = [];
    const stream = streaming('ws://sand.test/live', explain)
      .onMessage(event => frames.push(String(event.data)));
    await opened(stream);
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(frames).toEqual(['first', 'second']);
    stream.close();
  });

  test('a refused handshake reaches the failure side through the caller mapper', async () => {
    const failed = new Promise(resolve =>
      streaming('ws://127.0.0.1:9', explain).onFailure(resolve));

    expect(await failed).toMatch(/^socket: /);
  });

  test('the peer hanging up is an ending', async () => {
    server.use(live.addEventListener('connection', ({client}) => {
      setTimeout(() => client.close(), 5);
    }));

    const stream = streaming('ws://sand.test/live', explain);
    await opened(stream);
    const ended = await new Promise(resolve => {
      stream.onClose(() => resolve('ended'));
    });

    expect(ended).toBe('ended');
  });

  test('our own close is teardown, not an ending', async () => {
    server.use(live.addEventListener('connection', () => {}));

    let announced = false;
    const stream = streaming('ws://sand.test/live', explain)
      .onClose(() => {
        announced = true;
      });
    const socket = await opened(stream);
    stream.close();
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(socket.readyState).toBeGreaterThanOrEqual(WebSocket.CLOSING);
    expect(announced).toBe(false);
  });

  test('close is idempotent', async () => {
    server.use(live.addEventListener('connection', () => {}));

    const stream = streaming('ws://sand.test/live', explain);
    await opened(stream);
    stream.close();

    expect(() => stream.close()).not.toThrow();
  });

  test('close before the handshake lands aborts it silently', async () => {
    server.use(live.addEventListener('connection', () => {}));

    let heard = false;
    const stream = streaming('ws://sand.test/live', explain)
      .onFailure(() => {
        heard = true;
      })
      .onClose(() => {
        heard = true;
      });
    stream.close();
    await new Promise(resolve => setTimeout(resolve, 30));

    expect(heard).toBe(false);
  });

  test('settled facts replay for late listeners; the flow does not', async () => {
    server.use(live.addEventListener('connection', ({client}) => {
      client.send('early frame');
    }));

    const stream = streaming('ws://sand.test/live', explain);
    await opened(stream);
    await new Promise(resolve => setTimeout(resolve, 20));

    const lateFrames: string[] = [];
    const lateGreeting = await new Promise<WebSocket>(resolve => {
      stream.onMessage(event => lateFrames.push(String(event.data))).onOpen(resolve);
    });

    expect(lateGreeting.readyState).toBe(WebSocket.OPEN);
    expect(lateFrames).toEqual([]);
    stream.close();
  });

  test('the chain speaks fluently and returns itself', () => {
    const stream = streaming('ws://127.0.0.1:9', explain);

    expect(stream.onOpen(() => {}).onMessage(() => {}).onClose(() => {}).onFailure(() => {})).toBe(stream);
    stream.close();
  });
});
