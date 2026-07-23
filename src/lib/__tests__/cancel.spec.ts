import {http, HttpResponse, delay} from 'msw';
import {setupServer} from 'msw/node';
import {asyncResult, asyncSuccess} from '../asyncResult';
import {requesting} from '../requesting';

const server = setupServer();
const settled = () => new Promise<void>(resolve => setTimeout(resolve));

describe('cancel', () => {
  test('a canceled chain never pushes to its consumers', async () => {
    const onSuccess = vi.fn();
    const onComplete = vi.fn();
    const pending = asyncResult(Promise.resolve('value')).onSuccess(onSuccess).onComplete(onComplete);

    pending.cancel();
    await settled();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  test('cancel from the LAST link silences the whole chain — the useEffect cleanup idiom', async () => {
    const onSuccess = vi.fn();
    const isLoading = vi.fn();
    const cleanup = asyncResult(Promise.resolve('art'))
      .onPending(isLoading)
      .onSuccess(onSuccess).cancel;

    cleanup();
    await settled();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(isLoading).not.toHaveBeenCalledWith(false);
  });

  test('a failure is silenced just the same', async () => {
    const onFailure = vi.fn();
    const pending = asyncResult(Promise.reject('boom')).onFailure(onFailure);

    pending.cancel();
    await settled();

    expect(onFailure).not.toHaveBeenCalled();
  });

  test('cancel suppresses pushes, never corrupts pulls — an explicit read still settles honestly', async () => {
    const pending = asyncSuccess<string, string>('still here');
    pending.cancel();
    expect(await pending.orNull()).toBe('still here');
  });

  test('an uncanceled chain pushes normally — cancel is opt-in, not ambient', async () => {
    const onSuccess = vi.fn();
    asyncResult(Promise.resolve('value')).onSuccess(onSuccess);
    await settled();
    expect(onSuccess).toHaveBeenCalledWith('value');
  });
});

describe('onCancel', () => {
  test('cancel releases the attached work', async () => {
    const release = vi.fn();
    const pending = asyncResult(Promise.resolve('value')).onCancel(release);

    pending.cancel();

    expect(release).toHaveBeenCalledOnce();
  });

  test('cancel from a link AFTER the attachment still releases — one chain, one context', async () => {
    const release = vi.fn();
    const cleanup = asyncResult(Promise.resolve('value'))
      .onCancel(release)
      .map(value => value.length).cancel;

    cleanup();

    expect(release).toHaveBeenCalledOnce();
  });

  test('attaching to an already-canceled chain releases immediately — late work is not leaked', () => {
    const release = vi.fn();
    const pending = asyncResult(Promise.resolve('value'));
    pending.cancel();

    pending.onCancel(release);

    expect(release).toHaveBeenCalledOnce();
  });

  test('an uncanceled chain never releases', async () => {
    const release = vi.fn();
    await asyncResult(Promise.resolve('value')).onCancel(release).orNull();
    expect(release).not.toHaveBeenCalled();
  });
});

describe('requesting is cancelable', () => {
  beforeAll(() => server.listen({onUnhandledRequest: 'error'}));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('cancel aborts the in-flight exchange — the pull settles immediately instead of waiting out the server, and nothing is pushed', async () => {
    server.use(
      http.get('http://sand.test/slow', async () => {
        await delay(10_000);
        return HttpResponse.json({});
      })
    );
    const onSuccess = vi.fn();
    const onFailure = vi.fn();
    const pending = requesting('http://sand.test/slow', {method: 'GET'}, () => 'aborted')
      .onSuccess(onSuccess)
      .onFailure(onFailure);

    pending.cancel();
    const result = await pending.value;

    expect(result.isSuccess).toBe(false);
    expect(result.either(() => 'nope', reason => reason)).toBe('aborted');
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onFailure).not.toHaveBeenCalled();
  });
});
