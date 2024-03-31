import {asyncResult} from '../asyncResult';
import {Result} from '../types';
import {nextTick} from 'process';

const resolvePromises = () => new Promise(nextTick);

describe('result', () => {
  const successValue = 'successValue';
  const failureValue = 'failureValue';
  const defaultValue = 'defaultValue';
  const asyncSuccess: Result.Async<string, string> = asyncResult.of(Promise.resolve(successValue));
  const asyncFailure: Result.Async<string, string> = asyncResult.of(Promise.reject(failureValue));

  test('isSuccess', async () => {
    expect(await asyncSuccess.isSuccess).toBe(true);
    expect(await asyncFailure.isSuccess).toBe(false);
  });

  test('orElse', async () => {
    expect(await asyncSuccess.orElse(defaultValue)).toBe(successValue);
    expect(await asyncFailure.orElse(defaultValue)).toBe(defaultValue);
  });

  test('orNull', async () => {
    expect(await asyncSuccess.orNull()).toBe(successValue);
    expect(await asyncFailure.orNull()).toBeNull();
  });

  describe('onSuccess', () => {
    test('success', async () => {
      const func = vi.fn();
      asyncSuccess.onSuccess(func);
      await resolvePromises();
      expect(func).toHaveBeenCalledWith(successValue);
    });

    test('failure', async () => {
      const func = vi.fn();
      asyncFailure.onSuccess(func);
      await resolvePromises();
      expect(func).not.toHaveBeenCalled();
    });
  });

  describe('onFailure', () => {
    test('success', async () => {
      const func = vi.fn();
      asyncSuccess.onFailure(func);
      await resolvePromises();
      expect(func).not.toHaveBeenCalled();
    });

    test('failure', async () => {
      const func = vi.fn();
      asyncFailure.onFailure(func);
      await resolvePromises();
      expect(func).toHaveBeenCalledWith(failureValue);
    });
  });

  describe('onPending', () => {
    test('success', async () => {
      const func = vi.fn();
      asyncSuccess.onPending(func);
      expect(func).toHaveBeenCalledWith(true);
      await resolvePromises();
      expect(func).toHaveBeenCalledWith(false);
    });

    test('failure', async () => {
      const func = vi.fn();
      asyncFailure.onPending(func);
      expect(func).toHaveBeenCalledWith(true);
      await resolvePromises();
      expect(func).toHaveBeenCalledWith(false);
    });
  });

  describe('onComplete', () => {
    test('success', async () => {
      const func = vi.fn();
      asyncSuccess.onComplete(func);
      await resolvePromises();
      expect(func).toHaveBeenCalledWith(expect.objectContaining({isSuccess: true, identity: successValue}));
    });

    test('failure', async () => {
      const func = vi.fn();
      asyncFailure.onComplete(func);
      await resolvePromises();
      expect(func).toHaveBeenCalledWith(expect.objectContaining({isSuccess: false, identity: failureValue}));
    });
  });

  describe('map', () => {
    const value = 'value';

    test('success', async () => {
      expect(await asyncSuccess.map(() => value).isSuccess).toBe(true);
      expect(await asyncSuccess.map(() => value).orElse(defaultValue)).toBe(value);
      expect(await asyncSuccess.map((v) => v + value).orElse(defaultValue)).toBe(successValue + value);
    });

    test('failure', async () => {
      expect(await asyncFailure.map(() => value).isSuccess).toBe(false);
      expect(await asyncFailure.map(() => value).orElse(defaultValue)).toBe(defaultValue);
      expect(await asyncFailure.map((v: string) => v + value).orElse(defaultValue)).toBe(defaultValue);
    });
  });

  describe('mBind', () => {
    describe('success', () => {
      test('to success', async () => {
        expect(await asyncSuccess.mBind(() => asyncResult.success(successValue)).isSuccess).toBe(true);
        expect(await asyncSuccess.mBind(() => asyncResult.success(successValue)).orElse(defaultValue)).toBe(successValue);
        expect(await asyncSuccess.mBind((v) => asyncResult.success(v + successValue)).orElse(defaultValue)).toBe(successValue + successValue);
      });

      test('to failure', async () => {
        expect(await asyncSuccess.mBind(() => asyncResult.failure(failureValue)).isSuccess).toBe(false);
        expect(await asyncSuccess.mBind(() => asyncResult.failure(failureValue)).orElse(defaultValue)).toBe(defaultValue);
        const func = vi.fn();
        asyncSuccess.mBind((v) => asyncResult.failure(v + failureValue)).onFailure(func);
        await resolvePromises();
        expect(func).toHaveBeenCalledWith(successValue + failureValue);
      });
    });

    describe('failure', () => {
      test('to success', async () => {
        expect(await asyncFailure.mBind(() => asyncResult.success(successValue)).isSuccess).toBe(false);
        expect(await asyncFailure.mBind(() => asyncResult.success(successValue)).orElse(defaultValue)).toBe(defaultValue);
        expect(await asyncFailure.mBind((v: string) => asyncResult.success(v + successValue)).orElse(defaultValue)).toBe(defaultValue);
      });

      test('to failure', async () => {
        expect(await asyncFailure.mBind(() => asyncResult.failure(failureValue)).isSuccess).toBe(false);
        expect(await asyncFailure.mBind(() => asyncResult.failure(failureValue)).orElse(defaultValue)).toBe(defaultValue);
        const func = vi.fn();
        asyncFailure.mBind((v: string) => asyncResult.failure(v + failureValue)).onFailure(func);
        await resolvePromises();
        expect(func).toHaveBeenCalledWith(failureValue);
      });
    });
  });

  describe('or', () => {
    describe('success', () => {
      test('to success', async () => {
        expect(await asyncSuccess.or(() => asyncResult.success(successValue)).isSuccess).toBe(true);
        expect(await asyncSuccess.or(() => asyncResult.success(successValue)).orElse(defaultValue)).toBe(successValue);
        expect(await asyncSuccess.or((v: string) => asyncResult.success(v + successValue)).orElse(defaultValue)).toBe(successValue);
      });

      test('to failure', async () => {
        expect(await asyncSuccess.or(() => asyncResult.failure(failureValue)).isSuccess).toBe(true);
        expect(await asyncSuccess.or(() => asyncResult.failure(failureValue)).orElse(defaultValue)).toBe(successValue);
        expect(await asyncSuccess.or((v) => asyncResult.failure(v + failureValue)).orElse(defaultValue)).toBe(successValue);
      });
    });

    describe('failure', () => {
      test('to success', async () => {
        expect(await asyncFailure.or(() => asyncResult.success(successValue)).isSuccess).toBe(true);
        expect(await asyncFailure.or(() => asyncResult.success(successValue)).orElse(defaultValue)).toBe(successValue);
        expect(await asyncFailure.or((v) => asyncResult.success(v + successValue)).orElse(defaultValue)).toBe(failureValue + successValue);
      });

      test('to failure', async () => {
        expect(await asyncFailure.or(() => asyncResult.failure(failureValue)).isSuccess).toBe(false);
        expect(await asyncFailure.or(() => asyncResult.failure(failureValue)).orElse(defaultValue)).toBe(defaultValue);
        const func = vi.fn();
        asyncFailure.or((v) => asyncResult.failure(v + failureValue)).onFailure(func);
        await resolvePromises();
        expect(func).toHaveBeenCalledWith(failureValue + failureValue);
      });
    });
  });

  describe('either', () => {
    const failureResult = (): Result.Async<string, string> => asyncResult.failure(failureValue);
    const successResult = (): Result.Async<string, string> => asyncResult.success(successValue);

    test('when success it invokes the left hand parameter', async () => {
      expect(await asyncSuccess.either(successResult, failureResult).isSuccess).toBe(true);
      expect(await asyncSuccess.either(failureResult, successResult).isSuccess).toBe(false);
    });

    test('when failure it invokes the right hand parameter', async () => {
      expect(await asyncFailure.either(successResult, failureResult).isSuccess).toBe(false);
      expect(await asyncFailure.either(failureResult, successResult).isSuccess).toBe(true);
    });
  });
});
