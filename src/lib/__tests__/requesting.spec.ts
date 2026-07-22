import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';
import {requesting} from '../requesting';

const server = setupServer();

describe('requesting', () => {
  const networkExplain = (thrown: unknown) => `network: ${thrown}`;

  beforeAll(() => server.listen({onUnhandledRequest: 'error'}));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('the response comes back as the success', async () => {
    server.use(http.get('http://sand.test/thing', () => HttpResponse.json({ok: true})));

    const result = await requesting('http://sand.test/thing', {method: 'GET'}, networkExplain).value;

    expect(result.isSuccess).toBe(true);
    const response = result.orNull();
    expect(response?.status).toBe(200);
    await expect(response?.json()).resolves.toEqual({ok: true});
  });

  test('a body means stringify it and say it is JSON', async () => {
    let seen: {contentType: string | null; body: unknown} | undefined;
    server.use(
      http.post('http://sand.test/thing', async ({request}) => {
        seen = {contentType: request.headers.get('content-type'), body: await request.json()};
        return HttpResponse.json({});
      })
    );

    await requesting('http://sand.test/thing', {method: 'POST', body: {name: 'sand'}}, networkExplain).value;

    expect(seen).toEqual({contentType: 'application/json', body: {name: 'sand'}});
  });

  test('no body means no body sent and no content type invented', async () => {
    let seen: {contentType: string | null; body: string} | undefined;
    server.use(
      http.delete('http://sand.test/thing', async ({request}) => {
        seen = {contentType: request.headers.get('content-type'), body: await request.text()};
        return new HttpResponse(null, {status: 204});
      })
    );

    await requesting('http://sand.test/thing', {method: 'DELETE'}, networkExplain).value;

    expect(seen).toEqual({contentType: null, body: ''});
  });

  test('caller headers ride along with the JSON content type', async () => {
    let seen: {contentType: string | null; authorization: string | null} | undefined;
    server.use(
      http.post('http://sand.test/thing', ({request}) => {
        seen = {
          contentType: request.headers.get('content-type'),
          authorization: request.headers.get('authorization')
        };
        return HttpResponse.json({});
      })
    );

    await requesting(
      'http://sand.test/thing',
      {method: 'POST', body: {}, headers: {Authorization: 'Bearer t'}},
      networkExplain
    ).value;

    expect(seen).toEqual({contentType: 'application/json', authorization: 'Bearer t'});
  });

  test('a caller who names the content type wins over the JSON default', async () => {
    let seen: string | null | undefined;
    server.use(
      http.post('http://sand.test/thing', ({request}) => {
        seen = request.headers.get('content-type');
        return HttpResponse.json({});
      })
    );

    await requesting(
      'http://sand.test/thing',
      {method: 'POST', body: {}, headers: {'Content-Type': 'application/vnd.custom+json'}},
      networkExplain
    ).value;

    expect(seen).toBe('application/vnd.custom+json');
  });

  test('a network error is a failure shaped by onError, never a throw', async () => {
    server.use(http.get('http://sand.test/thing', () => HttpResponse.error()));

    const result = await requesting('http://sand.test/thing', {method: 'GET'}, networkExplain).value;

    expect(result.isSuccess).toBe(false);
    expect(result.either(() => 'nope', reason => reason)).toMatch(/^network: /);
  });

  test('a non-ok status is still a success — status policy belongs to the caller', async () => {
    server.use(http.get('http://sand.test/thing', () => new HttpResponse('gone', {status: 500})));

    const result = await requesting('http://sand.test/thing', {method: 'GET'}, networkExplain).value;

    expect(result.isSuccess).toBe(true);
    expect(result.orNull()?.status).toBe(500);
  });
});
