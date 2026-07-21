import {describe, expect, it} from 'vitest';
import {failure, Result, success} from '../result';
import {Maybe, nothing, some} from '../maybe';
import {asyncFailure, AsyncResult, asyncSuccess} from '../asyncResult';

describe('Result.allOf', () => {
  it('folds when every result succeeds', () =>
    expect(Result.allOf([success(1), success(2), success(3)], (a, b) => success(a + b), 0).orNull()).toEqual(6));

  it('can change the value type via the accumulator', () =>
    expect(Result.allOf([success(1), success(2)], (acc: string, value) => success(acc + value), '#').orNull()).toEqual('#12'));

  it('short-circuits to the first failure', () =>
    expect(Result.allOf([success<number, string>(1), failure('boom'), success(3)], (a, b) => success(a + b), 0).orNull()).toBeNull());

  it('short-circuits when the reducer fails', () =>
    expect(Result.allOf([success<number, string>(1), success(2)], () => failure('nope'), 0).orNull()).toBeNull());

  it('returns the seed for an empty batch', () =>
    expect(Result.allOf<number, never, number>([], (a, _b) => success(a), 42).orNull()).toEqual(42));
});

describe('Result.someOf', () => {
  it('keeps the successes and skips the failures', () =>
    expect(Result.someOf([success<number, string>(1), failure('x'), success(3)], (a, b) => success(a + b), 0).orNull()).toEqual(4));

  it('returns the seed when none succeed', () =>
    expect(Result.someOf([failure<string, number>('x'), failure('y')], (a, b) => success(a + b), 7).orNull()).toEqual(7));
});

describe('Maybe.allOf', () => {
  it('folds when every maybe is something', () =>
    expect(Maybe.allOf([some(1), some(2)], (a, b) => some(a + b), 0).orNull()).toEqual(3));

  it('short-circuits on nothing', () =>
    expect(Maybe.allOf([some(1), nothing(), some(3)], (a, b) => some(a + b), 0).orNull()).toBeNull());
});

describe('Maybe.someOf', () => {
  it('keeps the somethings and skips the nothings', () =>
    expect(Maybe.someOf([some(1), nothing(), some(3)], (a, b) => some(a + b), 0).orNull()).toEqual(4));
});

describe('AsyncResult.allOf', () => {
  it('folds when every result succeeds', async () =>
    expect(await AsyncResult.allOf([asyncSuccess<number, string>(1), asyncSuccess<number, string>(2)], (a, b) => asyncSuccess(a + b), 0).orNull()).toEqual(3));

  it('short-circuits to the first failure', async () =>
    expect(await AsyncResult.allOf([asyncSuccess<number, string>(1), asyncFailure<number, string>('x'), asyncSuccess<number, string>(3)], (a, b) => asyncSuccess(a + b), 0).orNull()).toBeNull());
});

describe('AsyncResult.someOf', () => {
  it('keeps the successes and skips the failures', async () =>
    expect(await AsyncResult.someOf([asyncSuccess<number, string>(1), asyncFailure<number, string>('x'), asyncSuccess<number, string>(3)], (a, b) => asyncSuccess(a + b), 0).orNull()).toEqual(4));
});
