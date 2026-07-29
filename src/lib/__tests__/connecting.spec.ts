import {ws} from 'msw';
import {setupServer} from 'msw/node';
import {connecting} from '../connecting';

const live = ws.link('ws://sand.test/live');
const server = setupServer();

describe('connecting', () => {
  const explain = (thrown: unknown) => `socket: ${thrown}`;

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('the open socket comes back whole as the success', async () => {
    server.use(live.addEventListener('connection', () => {}));

    const result = await connecting('ws://sand.test/live', explain).value;

    expect(result.isSuccess).toBe(true);
    expect(result.orNull()?.readyState).toBe(WebSocket.OPEN);
    result.orNull()?.close();
  });

  test('a refused handshake folds into the failure side through the caller mapper', async () => {
    const result = await connecting('ws://127.0.0.1:9', explain).value;

    expect(result.isSuccess).toBe(false);
    expect(result.orElse('refused')).toEqual('refused');
  });

  test('cancel closes the socket — the chain owns the teardown', async () => {
    server.use(live.addEventListener('connection', () => {}));

    const chain = connecting('ws://sand.test/live', explain);
    const socket = (await chain.value).orNull();
    chain.cancel();

    expect(socket?.readyState).toBeGreaterThanOrEqual(WebSocket.CLOSING);
  });

  test('cancel mid-handshake tears the attempt down and the pull still settles honestly', async () => {
    server.use(live.addEventListener('connection', () => {}));

    const chain = connecting('ws://sand.test/live', explain);
    chain.cancel();
    const result = await chain.value;

    expect(result.either(socket => socket.readyState, () => -1)).not.toBe(WebSocket.CONNECTING);
  });
});
