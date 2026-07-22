import {asyncTryCatch, tryCatch} from '../tryCatch';
import {toError} from '../util';

describe('tryCatch', () => {
  const explain = (thrown: unknown) => `caught: ${thrown}`;

  test('a returning fn is a success', () => {
    const result = tryCatch(() => 'value', explain);
    expect(result.isSuccess).toBe(true);
    expect(result.orNull()).toBe('value');
  });

  test('a throwing fn is a failure shaped by onError', () => {
    const result = tryCatch(() => {
      throw new Error('boom');
    }, explain);
    expect(result.isSuccess).toBe(false);
    expect(result.either(() => 'nope', reason => reason)).toBe('caught: Error: boom');
  });

  test('non-Error throws reach onError untouched', () => {
    const result = tryCatch(() => {
      throw 'plain string';
    }, thrown => thrown);
    expect(result.either(() => 'nope', reason => reason)).toBe('plain string');
  });
});

describe('asyncTryCatch', () => {
  const explain = (thrown: unknown) => `caught: ${thrown}`;

  test('a resolving fn is a success', async () => {
    const result = await asyncTryCatch(() => Promise.resolve('value'), explain).value;
    expect(result.isSuccess).toBe(true);
  });

  test('a fn that throws before producing a promise is a failure shaped by onError', async () => {
    const result = await asyncTryCatch((): Promise<string> => {
      throw new Error('sync boom');
    }, explain).value;
    expect(result.either(() => 'nope', reason => reason)).toBe('caught: Error: sync boom');
  });

  test('a rejecting promise is a failure shaped by onError', async () => {
    const result = await asyncTryCatch(() => Promise.reject(new Error('async boom')), explain).value;
    expect(result.either(() => 'nope', reason => reason)).toBe('caught: Error: async boom');
  });
});

describe('toError', () => {
  test('an Error passes through as itself', () => {
    const error = new Error('already an error');
    expect(toError(error)).toBe(error);
  });

  test('anything else wraps into an Error of its string form', () => {
    const wrapped = toError('just a string');
    expect(wrapped).toBeInstanceOf(Error);
    expect(wrapped.message).toBe('just a string');
  });
});
