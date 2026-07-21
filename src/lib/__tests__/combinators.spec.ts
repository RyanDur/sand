import {allOf, someOf} from '../combinators';
import {failure, success} from '../result';
import {nothing, some} from '../maybe';
import {asyncFailure, asyncSuccess} from '../asyncResult';

describe('allOf', () => {
  describe('results', () => {
    it('folds when every result succeeds', () =>
      expect(allOf([success(1), success(2), success(3)], (a, b) => success(a + b), success(0)).orNull()).toEqual(6));

    it('can change the value type via the accumulator', () =>
      expect(allOf([success(1), success(2)], (acc: string, value) => success(acc + value), success('#')).orNull()).toEqual('#12'));

    it('short-circuits to the first failure', () =>
      expect(allOf([success<number, string>(1), failure('boom'), success(3)], (a, b) => success(a + b), success(0)).orNull()).toBeNull());

    it('short-circuits when the reducer fails', () =>
      expect(allOf([success<number, string>(1), success(2)], () => failure('nope'), success(0)).orNull()).toBeNull());

    it('returns the seed for an empty batch', () =>
      expect(allOf([], (a) => success(a), success(42)).orNull()).toEqual(42));

    it('stays a failure when the seed has already failed', () =>
      expect(allOf([success<number, string>(1), success(2)], (a, b) => success(a + b), failure<string, number>('dead')).orNull()).toBeNull());
  });

  describe('maybes', () => {
    it('folds when every maybe is something', () =>
      expect(allOf([some(1), some(2)], (a, b) => some(a + b), some(0)).orNull()).toEqual(3));

    it('short-circuits on nothing', () =>
      expect(allOf([some(1), nothing(), some(3)], (a, b) => some(a + b), some(0)).orNull()).toBeNull());

    it('returns the seed for an empty batch', () =>
      expect(allOf([], (a) => some(a), some(42)).orNull()).toEqual(42));
  });

  describe('async results', () => {
    it('folds when every result succeeds', async () =>
      expect(await allOf([asyncSuccess<number, string>(1), asyncSuccess<number, string>(2)], (a, b) => asyncSuccess(a + b), asyncSuccess(0)).orNull()).toEqual(3));

    it('short-circuits to the first failure', async () =>
      expect(await allOf([asyncSuccess<number, string>(1), asyncFailure<number, string>('x'), asyncSuccess<number, string>(3)], (a, b) => asyncSuccess(a + b), asyncSuccess(0)).orNull()).toBeNull());

    it('returns the seed for an empty batch', async () =>
      expect(await allOf([], (a) => asyncSuccess<number, string>(a), asyncSuccess<number, string>(42)).orNull()).toEqual(42));
  });
});

describe('someOf', () => {
  describe('results', () => {
    it('keeps the successes and skips the failures', () =>
      expect(someOf([success<number, string>(1), failure('x'), success(3)], (a, b) => success(a + b), success(0)).orNull()).toEqual(4));

    it('returns the seed when none succeed', () =>
      expect(someOf([failure<string, number>('x'), failure('y')], (a, b) => success(a + b), success(7)).orNull()).toEqual(7));

    it('propagates a failure from the reducer', () =>
      expect(someOf([success<number, string>(1), success(2)], () => failure('nope'), success(0)).orNull()).toBeNull());
  });

  describe('maybes', () => {
    it('keeps the somethings and skips the nothings', () =>
      expect(someOf([some(1), nothing(), some(3)], (a, b) => some(a + b), some(0)).orNull()).toEqual(4));

    it('propagates a nothing from the reducer', () =>
      expect(someOf([some(1), some(2)], () => nothing(), some(0)).orNull()).toBeNull());
  });

  describe('async results', () => {
    it('keeps the successes and skips the failures', async () =>
      expect(await someOf([asyncSuccess<number, string>(1), asyncFailure<number, string>('x'), asyncSuccess<number, string>(3)], (a, b) => asyncSuccess(a + b), asyncSuccess(0)).orNull()).toEqual(4));

    it('propagates a failure from the reducer', async () =>
      expect(await someOf([asyncSuccess<number, string>(1), asyncSuccess<number, string>(2)], () => asyncFailure<number, string>('nope'), asyncSuccess<number, string>(0)).orNull()).toBeNull());
  });
});
