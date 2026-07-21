import {asyncFailure, asyncResult, asyncSuccess} from '../asyncResult';
import {Result} from '../types';

const resolvePromises = () => new Promise<void>(resolve => setTimeout(resolve));

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

    test('success', async () => {
      await expect(success.map(() => value).orElse(defaultValue)).resolves.toBe(value);
      await expect(success.map((v) => v + value).orElse(defaultValue)).resolves.toBe(successValue + value);
    });

    test('failure', async () => {
      await expect(failure.map(() => value).orElse(defaultValue)).resolves.toBe(defaultValue);
      await expect(failure.map((v: string) => v + value).orElse(defaultValue)).resolves.toBe(defaultValue);
    });
  });

  describe('mBind', () => {
    describe('success', () => {
      test('to success', async () => {
        await expect(success.mBind(() => asyncSuccess(successValue)).orElse(defaultValue)).resolves.toBe(successValue);
        await expect(success.mBind((v) => asyncSuccess(v + successValue)).orElse(defaultValue)).resolves.toBe(successValue + successValue);
      });

      test('to failure', async () => {
        await expect(success.mBind(() => asyncFailure(failureValue)).orElse(defaultValue)).resolves.toBe(defaultValue);
        const func = vi.fn();
        success.mBind((v) => asyncFailure(v + failureValue)).onFailure(func);
        await resolvePromises();
        expect(func).toHaveBeenCalledWith(successValue + failureValue);
      });
    });

    describe('failure', () => {
      test('to success', async () => {
        await expect(failure.mBind(() => asyncSuccess(successValue)).orElse(defaultValue)).resolves.toBe(defaultValue);
        await expect(failure.mBind((v) => asyncSuccess(v + successValue)).orElse(defaultValue)).resolves.toBe(defaultValue);
      });

      test('to failure', async () => {
        await expect(failure.mBind(() => asyncFailure(failureValue)).orElse(defaultValue)).resolves.toBe(defaultValue);
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
        await expect(success.or(() => asyncSuccess(successValue)).orElse(defaultValue)).resolves.toBe(successValue);
        await expect(success.or((v: string) => asyncSuccess(v + successValue)).orElse(defaultValue)).resolves.toBe(successValue);
      });

      test('to failure', async () => {
        await expect(success.or(() => asyncFailure(failureValue)).orElse(defaultValue)).resolves.toBe(successValue);
        await expect(success.or((v) => asyncFailure(v + failureValue)).orElse(defaultValue)).resolves.toBe(successValue);
      });
    });

    describe('failure', () => {
      test('to success', async () => {
        await expect(failure.or(() => asyncSuccess(successValue)).orElse(defaultValue)).resolves.toBe(successValue);
        await expect(failure.or((v) => asyncSuccess(v + successValue)).orElse(defaultValue)).resolves.toBe(failureValue + successValue);
      });

      test('to failure', async () => {
        await expect(failure.or(() => asyncFailure(failureValue)).orElse(defaultValue)).resolves.toBe(defaultValue);
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
      await expect(success.either(successResult, failureResult).value).resolves.toEqual(expect.objectContaining({isSuccess: true}));
      await expect(success.either(failureResult, successResult).value).resolves.toEqual(expect.objectContaining({isSuccess: false}));
    });

    test('when failure it invokes the right hand parameter', async () => {
      await expect(failure.either(successResult, failureResult).value).resolves.toEqual(expect.objectContaining({isSuccess: false}));
      await expect(failure.either(failureResult, successResult).value).resolves.toEqual(expect.objectContaining({isSuccess: true}));
    });
  });
});
