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
      expect(func).toHaveBeenCalledWith(expect.objectContaining({isSuccess: true, value: successValue}));
    });

    test('failure', async () => {
      const func = vi.fn();
      failure.onComplete(func);
      await resolvePromises();
      expect(func).toHaveBeenCalledWith(expect.objectContaining({isSuccess: false, reason: failureValue}));
    });
  });

  describe('map', () => {
    const value = 'value';

    test('success', () => {
      expect(success.map(() => value).orElse(defaultValue)).resolves.toBe(value);
      expect(success.map((v) => v + value).orElse(defaultValue)).resolves.toBe(successValue + value);
    });

    test('failure', () => {
      expect(failure.map(() => value).orElse(defaultValue)).resolves.toBe(defaultValue);
      expect(failure.map((v: string) => v + value).orElse(defaultValue)).resolves.toBe(defaultValue);
    });
  });

  describe('mBind', () => {
    describe('success', () => {
      test('to success', () => {
        expect(success.mBind(() => asyncSuccess(successValue)).orElse(defaultValue)).resolves.toBe(successValue);
        expect(success.mBind((v) => asyncSuccess(v + successValue)).orElse(defaultValue)).resolves.toBe(successValue + successValue);
      });

      test('to failure', async () => {
        expect(success.mBind(() => asyncFailure(failureValue)).orElse(defaultValue)).resolves.toBe(defaultValue);
        const func = vi.fn();
        success.mBind((v) => asyncFailure(v + failureValue)).onFailure(func);
        await resolvePromises();
        expect(func).toHaveBeenCalledWith(successValue + failureValue);
      });
    });

    describe('failure', () => {
      test('to success', () => {
        expect(failure.mBind(() => asyncSuccess(successValue)).orElse(defaultValue)).resolves.toBe(defaultValue);
        expect(failure.mBind((v) => asyncSuccess(v + successValue)).orElse(defaultValue)).resolves.toBe(defaultValue);
      });

      test('to failure', async () => {
        expect(failure.mBind(() => asyncFailure(failureValue)).orElse(defaultValue)).resolves.toBe(defaultValue);
        const func = vi.fn();
        failure.mBind((v: string) => asyncFailure(v + failureValue)).onFailure(func);
        await resolvePromises();
        expect(func).toHaveBeenCalledWith(failureValue);
      });
    });
  });

  describe('or', () => {
    describe('success', () => {
      test('to success', () => {
        expect(success.or(() => asyncSuccess(successValue)).orElse(defaultValue)).resolves.toBe(successValue);
        expect(success.or((v: string) => asyncSuccess(v + successValue)).orElse(defaultValue)).resolves.toBe(successValue);
      });

      test('to failure', () => {
        expect(success.or(() => asyncFailure(failureValue)).orElse(defaultValue)).resolves.toBe(successValue);
        expect(success.or((v) => asyncFailure(v + failureValue)).orElse(defaultValue)).resolves.toBe(successValue);
      });
    });

    describe('failure', () => {
      test('to success', () => {
        expect(failure.or(() => asyncSuccess(successValue)).orElse(defaultValue)).resolves.toBe(successValue);
        expect(failure.or((v) => asyncSuccess(v + successValue)).orElse(defaultValue)).resolves.toBe(failureValue + successValue);
      });

      test('to failure', async () => {
        expect(failure.or(() => asyncFailure(failureValue)).orElse(defaultValue)).resolves.toBe(defaultValue);
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

    test('when success it invokes the left hand parameter', () => {
      expect(success.either(successResult, failureResult).value).resolves.toEqual(expect.objectContaining({isSuccess: true}));
      expect(success.either(failureResult, successResult).value).resolves.toEqual(expect.objectContaining({isSuccess: false}));
    });

    test('when failure it invokes the right hand parameter', () => {
      expect(failure.either(successResult, failureResult).value).resolves.toEqual(expect.objectContaining({isSuccess: false}));
      expect(failure.either(failureResult, successResult).value).resolves.toEqual(expect.objectContaining({isSuccess: true}));
    });
  });
});
