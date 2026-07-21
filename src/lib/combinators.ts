import {Maybe, Result} from './types';

type Chain = {
  mBind(f: (value: unknown) => unknown): Chain;
};

type FoldEither = {
  either(onSuccess: (value: unknown) => unknown, onFailure: (reason: unknown) => unknown): unknown;
};

type FoldMaybe = {
  readonly isNothing: boolean;
  map(f: (value: unknown) => unknown): {orElse(fallback: unknown): unknown};
};

// `function` statements in an arrow-function codebase: TypeScript's overload leniency
// only exists for function declarations. An arrow assigned to an overloaded type is
// checked strictly and no single implementation is a subtype of all three signatures,
// so this is the one cast-free way to fold every container through one name.

/**
 * Folds a batch onto a wrapped seed, requiring every item to succeed.
 * The seed's container decides the container of the whole fold:
 * pass Results, Maybes, or AsyncResults and get the same kind back.
 *
 * ```ts
 * allOf([success(1), success(2)], (a, b) => success(a + b), success(0)).orNull(); // produces: 3
 * allOf([some(1), nothing()], (a, b) => some(a + b), some(0)).orNull(); // produces: null
 * ```
 * */
export function allOf<VALUE, ACC, ERROR>(
  results: readonly Result<VALUE, ERROR>[],
  reducer: (accumulator: ACC, value: VALUE) => Result<ACC, ERROR>,
  seed: Result<ACC, ERROR>
): Result<ACC, ERROR>;
export function allOf<VALUE, ACC>(
  maybes: readonly Maybe<VALUE>[],
  reducer: (accumulator: ACC, value: VALUE) => Maybe<ACC>,
  seed: Maybe<ACC>
): Maybe<ACC>;
export function allOf<VALUE, ACC, ERROR>(
  results: readonly Result.Async<VALUE, ERROR>[],
  reducer: (accumulator: ACC, value: VALUE) => Result.Async<ACC, ERROR>,
  seed: Result.Async<ACC, ERROR>
): Result.Async<ACC, ERROR>;
export function allOf(
  items: readonly Chain[],
  reducer: (accumulator: unknown, value: unknown) => unknown,
  seed: Chain
): Chain {
  return items.reduce((accumulator, item) => accumulator.mBind(a => item.mBind(v => reducer(a, v))), seed);
}

/**
 * Folds a batch onto a wrapped seed, keeping the items that succeed and
 * skipping the ones that do not. A failure from the reducer itself still
 * fails the whole fold.
 *
 * ```ts
 * someOf([success(1), failure('x'), success(3)], (a, b) => success(a + b), success(0)).orNull(); // produces: 4
 * ```
 * */
export function someOf<VALUE, ACC, ERROR>(
  results: readonly Result<VALUE, ERROR>[],
  reducer: (accumulator: ACC, value: VALUE) => Result<ACC, ERROR>,
  seed: Result<ACC, ERROR>
): Result<ACC, ERROR>;
export function someOf<VALUE, ACC>(
  maybes: readonly Maybe<VALUE>[],
  reducer: (accumulator: ACC, value: VALUE) => Maybe<ACC>,
  seed: Maybe<ACC>
): Maybe<ACC>;
export function someOf<VALUE, ACC, ERROR>(
  results: readonly Result.Async<VALUE, ERROR>[],
  reducer: (accumulator: ACC, value: VALUE) => Result.Async<ACC, ERROR>,
  seed: Result.Async<ACC, ERROR>
): Result.Async<ACC, ERROR>;
export function someOf(
  items: readonly (FoldEither | FoldMaybe)[],
  reducer: (accumulator: unknown, value: unknown) => unknown,
  seed: Chain
): Chain {
  return items.reduce<Chain>((accumulator, item) => accumulator.mBind(a => 'isNothing' in item
    ? item.map(v => reducer(a, v)).orElse(accumulator)
    : item.either(v => reducer(a, v), () => accumulator)), seed);
}
