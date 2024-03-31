import {asyncFailure, asyncResult, asyncSuccess} from '../asyncResult';
import {Result} from '../types';
import {nextTick} from 'process';

const resolvePromises = () => new Promise(nextTick);

describe('result', () => {
  const successValue = 'successValue';
  const failureValue = 'failureValue';
  const defaultValue = 'defaultValue';
  const success: Result.Async<string, string> = asyncResult(Promise.resolve(successValue));
  const failure: Result.Async<string, string> = asyncResult(Promise.reject(failureValue));

  test('orElse', async () => {
    expect(await success.orElse(defaultValue)).toBe(successValue);
    expect(await failure.orElse(defaultValue)).toBe(defaultValue);
  });

  test('orNull', async () => {
    expect(await success.orNull()).toBe(successValue);
    expect(await failure.orNull()).toBeNull();
  });

  describe('onSuccess', () => {
    test('success', async () => {
      const func = vi.fn();
      success.onSuccess(func);
      await resolvePromises();
      expect(func).toHaveBeenCalledWith(successValue);
    });

    test('failure', async () => {
      const func = vi.fn();
      failure.onSuccess(func);
      await resolvePromises();
      expect(func).not.toHaveBeenCalled();
    });
  });

  describe('onFailure', () => {
    test('success', async () => {
      const func = vi.fn();
      success.onFailure(func);
      await resolvePromises();
      expect(func).not.toHaveBeenCalled();
    });

    test('failure', async () => {
      const func = vi.fn();
      failure.onFailure(func);
      await resolvePromises();
      expect(func).toHaveBeenCalledWith(failureValue);
    });
  });

  describe('onPending', () => {
    test('success', async () => {
      const func = vi.fn();
      success.onPending(func);
      expect(func).toHaveBeenCalledWith(true);
      await resolvePromises();
      expect(func).toHaveBeenCalledWith(false);
    });

    test('failure', async () => {
      const func = vi.fn();
      failure.onPending(func);
      expect(func).toHaveBeenCalledWith(true);
      await resolvePromises();
      expect(func).toHaveBeenCalledWith(false);
    });
  });

  describe('onComplete', () => {
    test('success', async () => {
      const func = vi.fn();
      success.onComplete(func);
      await resolvePromises();
      expect(func).toHaveBeenCalledWith(expect.objectContaining({isSuccess: true, identity: successValue}));
    });

    test('failure', async () => {
      const func = vi.fn();
      failure.onComplete(func);
      await resolvePromises();
      expect(func).toHaveBeenCalledWith(expect.objectContaining({isSuccess: false, identity: failureValue}));
    });
  });

  describe('map', () => {
    const value = 'value';

    test('success', async () => {
      expect(await success.map(() => value).orElse(defaultValue)).toBe(value);
      expect(await success.map((v) => v + value).orElse(defaultValue)).toBe(successValue + value);
    });

    test('failure', async () => {
      expect(await failure.map(() => value).orElse(defaultValue)).toBe(defaultValue);
      expect(await failure.map((v: string) => v + value).orElse(defaultValue)).toBe(defaultValue);
    });
  });

  describe('mBind', () => {
    describe('success', () => {
      test('to success', async () => {
        expect(await success.mBind(() => asyncSuccess(successValue)).orElse(defaultValue)).toBe(successValue);
        expect(await success.mBind((v) => asyncSuccess(v + successValue)).orElse(defaultValue)).toBe(successValue + successValue);
      });

      test('to failure', async () => {
        expect(await success.mBind(() => asyncFailure(failureValue)).orElse(defaultValue)).toBe(defaultValue);
        const func = vi.fn();
        success.mBind((v) => asyncFailure(v + failureValue)).onFailure(func);
        await resolvePromises();
        expect(func).toHaveBeenCalledWith(successValue + failureValue);
      });
    });

    describe('failure', () => {
      test('to success', async () => {
        expect(await failure.mBind(() => asyncSuccess(successValue)).orElse(defaultValue)).toBe(defaultValue);
        expect(await failure.mBind((v: string) => asyncSuccess(v + successValue)).orElse(defaultValue)).toBe(defaultValue);
      });

      test('to failure', async () => {
        expect(await failure.mBind(() => asyncFailure(failureValue)).orElse(defaultValue)).toBe(defaultValue);
        const func = vi.fn();
        failure.mBind((v: string) => asyncFailure(v + failureValue)).onFailure(func);
        await resolvePromises();
        expect(func).toHaveBeenCalledWith(failureValue);
      });
    });
  });

  describe('or', () => {
    describe('success', () => {
      test('to success', async () => {
        expect(await success.or(() => asyncSuccess(successValue)).orElse(defaultValue)).toBe(successValue);
        expect(await success.or((v: string) => asyncSuccess(v + successValue)).orElse(defaultValue)).toBe(successValue);
      });

      test('to failure', async () => {
        expect(await success.or(() => asyncFailure(failureValue)).orElse(defaultValue)).toBe(successValue);
        expect(await success.or((v) => asyncFailure(v + failureValue)).orElse(defaultValue)).toBe(successValue);
      });
    });

    describe('failure', () => {
      test('to success', async () => {
        expect(await failure.or(() => asyncSuccess(successValue)).orElse(defaultValue)).toBe(successValue);
        expect(await failure.or((v) => asyncSuccess(v + successValue)).orElse(defaultValue)).toBe(failureValue + successValue);
      });

      test('to failure', async () => {
        expect(await failure.or(() => asyncFailure(failureValue)).orElse(defaultValue)).toBe(defaultValue);
        const func = vi.fn();
        failure.or((v) => asyncFailure(v + failureValue)).onFailure(func);
        await resolvePromises();
        expect(func).toHaveBeenCalledWith(failureValue + failureValue);
      });
    });
  });

  describe('either', () => {
    const failureResult = (): Result.Async<string, string> => asyncFailure(failureValue);
    const successResult = (): Result.Async<string, string> => asyncSuccess(successValue);

    test('when success it invokes the left hand parameter', async () => {
      expect((await success.either(successResult, failureResult).identity).isSuccess).toBe(true);
      expect((await success.either(failureResult, successResult).identity).isSuccess).toBe(false);
    });

    test('when failure it invokes the right hand parameter', async () => {
      expect((await failure.either(successResult, failureResult).identity).isSuccess).toBe(false);
      expect((await failure.either(failureResult, successResult).identity).isSuccess).toBe(true);
    });
  });
});
