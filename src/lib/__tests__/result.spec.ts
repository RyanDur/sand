import {failure, success} from '../result';
import {expect} from 'vitest';

describe('result', () => {
  const value = 'value';
  const newValue = 'newValue';
  const defaultValue = 'defaultValue';

  test('isSuccess', () => {
    expect(success(value).isSuccess).toBe(true);
    expect(failure(value).isSuccess).toBe(false);
  });

  test('orElse', () => {
    expect(success(value).orElse('fail')).toBe(value);
    expect(failure(value).orElse(newValue)).toBe(newValue);
  });

  test('orNull', () => {
    expect(success(value).orNull()).toBe(value);
    expect(failure(value).orNull()).toBeNull();
  });

  describe('onSuccess', () => {
    test('success', () => {
      const func = vi.fn();
      success(value).onSuccess(func);
      expect(func).toHaveBeenCalledWith(value);
    });

    test('failure', () => {
      const func = vi.fn();
      failure(value).onSuccess(func);
      expect(func).not.toHaveBeenCalled();
    });
  });

  describe('onFailure', () => {
    test('success', () => {
      const func = vi.fn();
      success(value).onFailure(func);
      expect(func).not.toHaveBeenCalled();
    });

    test('failure', () => {
      const func = vi.fn();
      failure(value).onFailure(func);
      expect(func).toHaveBeenCalledWith(value);
    });
  });

  describe('onComplete', () => {
    test('success', () => {
      const func = vi.fn();
      success(value).onComplete(func);
      expect(func).toHaveBeenCalledWith(expect.objectContaining({
        isSuccess: true,
        identity: value,
      }));
    });

    test('failure', () => {
      const func = vi.fn();
      failure(value).onComplete(func);
      expect(func).toHaveBeenCalledWith(expect.objectContaining({
        isSuccess: false,
        identity: value,
      }));
    });
  });

  describe('map', () => {
    test('success', () => {
      expect(success(value).map(() => newValue)).toEqual(expect.objectContaining({
        isSuccess: true,
        identity: newValue,
      }));
      expect(success(value).map((v) => v + newValue)).toEqual(expect.objectContaining({
        isSuccess: true,
        identity: value + newValue,
      }));
    });

    test('failure', () => {
      expect(failure(value).map(() => newValue)).toEqual(expect.objectContaining({
        isSuccess: false,
        identity: value,
      }));
      expect(failure(value).map((v: string) => v + newValue)).toEqual(expect.objectContaining({
        isSuccess: false,
        identity: value,
      }));
    });
  });

  describe('mBind', () => {
    describe('success', () => {
      test('to success', () => {
        expect(success(value).mBind(() => success(newValue)).isSuccess).toBe(true);
        expect(
          success(value)
            .mBind(() => success(newValue))
            .orElse(defaultValue),
        ).toBe(newValue);
        expect(
          success(value)
            .mBind((v) => success(v + newValue))
            .orElse(defaultValue),
        ).toBe(value + newValue);
      });

      test('to failure', () => {
        expect(success(value).mBind(() => failure(newValue)).isSuccess).toBe(false);
        expect(
          success(value)
            .mBind(() => failure(newValue))
            .orElse(defaultValue),
        ).toBe(defaultValue);
        expect(
          success(value)
            .mBind((v) => failure(v + newValue))
            .orElse(defaultValue),
        ).toBe(defaultValue);
      });
    });

    test('failure', () => {
      expect(failure(value).mBind(() => success('fail')).isSuccess).toBe(false);
    });
  });

  describe('or', () => {
    test('success', () => {
      expect(
        success(value)
          .or(() => failure('fail'))
          .orElse('fail'),
      ).toBe(value);
    });

    describe('failure', () => {
      test('to success', () => {
        expect(failure(value).or(() => success(newValue)).isSuccess).toBe(true);
        failure(value)
          .or(() => failure(newValue))
          .onSuccess((v) => expect(v).toBe(newValue));
        failure(value)
          .or((v) => failure(v + newValue))
          .onSuccess((v) => expect(v).toBe(value + newValue));
      });

      test('to failure', () => {
        expect(failure(value).or(() => failure(newValue)).isSuccess).toBe(false);
        failure(value)
          .or(() => failure(newValue))
          .onFailure((v) => expect(v).toBe(newValue));
        failure(value)
          .or((v) => failure(v + newValue))
          .onFailure((v) => expect(v).toBe(value + newValue));
      });
    });

    describe('either', () => {
      const failureResult = () => failure('failureValue');
      const successResult = () => success('successValue');

      test('when success it invokes the left hand parameter', () => {
        expect(success(value).either(successResult, failureResult).isSuccess).toBe(true);
        expect(success(value).either(failureResult, successResult).isSuccess).toBe(false);
      });

      test('when failure it invokes the right hand parameter', () => {
        expect(failure(value).either(successResult, failureResult).isSuccess).toBe(false);
        expect(failure(value).either(failureResult, successResult).isSuccess).toBe(true);
      });
    });
  });
});
