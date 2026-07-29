import {failure, success} from '../result';
import {Result} from '../types';
import {lawsOf} from './laws';

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
        value,
      }));
    });

    test('failure', () => {
      const func = vi.fn();
      failure(value).onComplete(func);
      expect(func).toHaveBeenCalledWith(expect.objectContaining({
        isSuccess: false,
        reason: value,
      }));
    });
  });

  describe('map', () => {
    test('success', () => {
      expect(success(value).map(() => newValue)).toEqual(expect.objectContaining({
        isSuccess: true,
        value: newValue,
      }));
      expect(success(value).map((v) => v + newValue)).toEqual(expect.objectContaining({
        isSuccess: true,
        value: value + newValue,
      }));
    });

    test('failure', () => {
      expect(failure(value).map(() => newValue)).toEqual(expect.objectContaining({
        isSuccess: false,
        reason: value,
      }));
      expect(failure(value).map((v: string) => v + newValue)).toEqual(expect.objectContaining({
        isSuccess: false,
        reason: value,
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

  describe('no-op operations return the same instance', () => {
    test('or on success', () => {
      const result = success(value);
      expect(result.or(() => failure('fail'))).toBe(result);
    });

    test('map on failure', () => {
      const result = failure(value);
      expect(result.map(() => newValue)).toBe(result);
    });

    test('mBind on failure', () => {
      const result = failure(value);
      expect(result.mBind(() => success(newValue))).toBe(result);
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

describe('Result is a lawful Functor, Monad, and Catamorphism', () => {
  const eq = (left: Result<number, string>, right: Result<number, string>): void =>
    expect(left.inspect()).toEqual(right.inspect());
  const laws = lawsOf<Result<number, string>, void>(success, eq);
  const hit = (value: number): string => `hit ${value}`;
  const miss = (reason: string): string => `miss ${reason}`;

  test('monad left identity: success(a).mBind(f) is f(a)', laws.leftIdentity);
  test('monad right identity holds on both branches', () => {
    laws.rightIdentity(success(3));
    laws.rightIdentity(failure('boom'));
  });
  test('monad associativity holds on both branches', () => {
    laws.associativity(success(3));
    laws.associativity(failure('boom'));
  });
  test('functor identity holds on both branches', () => {
    laws.mapIdentity(success(3));
    laws.mapIdentity(failure('boom'));
  });
  test('functor composition holds on both branches', () => {
    laws.mapComposition(success(3));
    laws.mapComposition(failure('boom'));
  });
  test('catamorphism computation: folding a constructor selects its branch', () => {
    expect(success<number, string>(3).either(hit, miss)).toEqual('hit 3');
    expect(failure<string, number>('e').either(hit, miss)).toEqual('miss e');
  });
  test('catamorphism reflection: folding with the constructors rebuilds the value', () => {
    const reflect = (m: Result<number, string>): void =>
      expect(m.either(success, failure).inspect()).toEqual(m.inspect());
    reflect(success(3));
    reflect(failure('e'));
  });
  test('catamorphism fusion: a function after the fold distributes into both branches', () => {
    const shout = (folded: string): string => folded.toUpperCase();
    const fused = (m: Result<number, string>): void =>
      expect(shout(m.either(hit, miss))).toEqual(
        m.either(value => shout(hit(value)), reason => shout(miss(reason)))
      );
    fused(success(3));
    fused(failure('e'));
  });
});
