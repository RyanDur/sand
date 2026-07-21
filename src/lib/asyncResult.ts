import {failure as err, success as ok} from './result';
import {Result} from './types';
import {inspect} from './util';

const ofPromise = <SUCCESS, FAILURE>(promise: Promise<Result<SUCCESS, FAILURE>>): Result.Async<SUCCESS, FAILURE> => ({
  value: promise,
  orNull: () => promise.then(result => result.orNull()),
  orElse: fallback => promise.then(result => result.orElse(fallback)),
  map: fn => ofPromise(promise.then(result => result.map(fn))),
  mBind: <U>(fn: (value: SUCCESS) => Result.Async<U, FAILURE>) => ofPromise<U, FAILURE>(promise.then((result) => result.isSuccess ? fn(result.value).value : err<FAILURE, U>(result.reason))),
  or: <U>(fn: (reason: FAILURE) => Result.Async<SUCCESS, U>) => ofPromise<SUCCESS, U>(promise.then(result => result.isSuccess ? ok<SUCCESS, U>(result.value) : fn(result.reason).value)),
  either: (onSuccess, onFailure) => ofPromise(promise.then(result => result.isSuccess
    ? onSuccess(result.value).value
    : onFailure(result.reason).value)),
  onPending: (waiting) => {
    waiting(true);
    return ofPromise(promise.then((result) => result.onComplete(() => waiting(false))));
  },
  onSuccess: consumer => ofPromise(promise.then(result => result.onSuccess(consumer))),
  onFailure: consumer => ofPromise(promise.then(result => result.onFailure(consumer))),
  onComplete: consumer => ofPromise(promise.then(result => result.onComplete(consumer))),
  inspect: () => promise.then(value => `Result.Async(${inspect(value)})`)
});

/**
 * {@link https://github.com/RyanDur/sand/blob/f36b1bbc5e93b319400dd4a8f53decc5dc7d60ea/src/lib/asyncResult.ts#L6 | orNull Implementation}
 *
 * {@link https://github.com/RyanDur/sand/blob/f36b1bbc5e93b319400dd4a8f53decc5dc7d60ea/src/lib/asyncResult.ts#L8 | orElse Implementation}
 * ```ts
 * const successfulResult = asyncSuccess('some value').map(value => value + ', another value');
 * await successfulResult.orNull(); // produces: "some value, another value"
 * await successfulResult.orElse('fallback'); // produces: "some value, another value" (orElse returns the value for a success)
 * ```
 * */
export const asyncSuccess = <S, F>(value: S): Result.Async<S, F> => ofPromise<S, F>(Promise.resolve(ok<S, F>(value)));

/**
 * ```ts
 * const failureResult = asyncFailure('some failure').or(reason => asyncFailure(reason + ', another failure'));
 * await failureResult.orNull(); // produces: null
 * await failureResult.orElse('Not this'); // produces: "Not this" (orElse returns the fallback for a failure)
 * ```
 * */
export const asyncFailure = <S, F>(value: F): Result.Async<S, F> => ofPromise<S, F>(Promise.resolve(err<F, S>(value)));

/**
 * ```ts
 * const successfulResult = asyncResult(Promise.resolve('some value')).map(value => value + ', another value');
 * await successfulResult.orNull(); // produces: "some value, another value"
 * ```
 * ```ts
 * const failureResult = asyncResult(Promise.reject('some failure')).or(reason => asyncFailure(reason + ', another failure'));
 * await failureResult.orNull(); // produces: null
 * await failureResult.orElse('Not this'); // produces: "Not this"
 * ```
 * */
export const asyncResult = <S, F>(promise: Promise<S>): Result.Async<S, F> => ofPromise<S, F>(promise.then(ok<S, F>).catch(err<F, S>));

const allOf = <VALUE, ERROR, ACC>(
  results: readonly Result.Async<VALUE, ERROR>[],
  reducer: (accumulator: ACC, value: VALUE) => Result.Async<ACC, ERROR>,
  seed: ACC
): Result.Async<ACC, ERROR> =>
  results.reduce<Result.Async<ACC, ERROR>>(
    (accumulator, item) => accumulator.mBind(a => item.mBind(v => reducer(a, v))),
    asyncSuccess<ACC, ERROR>(seed)
  );

const someOf = <VALUE, ERROR, ACC>(
  results: readonly Result.Async<VALUE, ERROR>[],
  reducer: (accumulator: ACC, value: VALUE) => Result.Async<ACC, ERROR>,
  seed: ACC
): Result.Async<ACC, ERROR> =>
  results.reduce<Result.Async<ACC, ERROR>>(
    (accumulator, item) => accumulator.mBind(a => item.either(v => reducer(a, v), () => asyncSuccess<ACC, ERROR>(a))),
    asyncSuccess<ACC, ERROR>(seed)
  );

/**
 * `AsyncResult.all` requires every result to succeed; `AsyncResult.some` keeps the ones that do.
 * Both fold a batch of pending results onto a seed.
 */
export const AsyncResult = {allOf, someOf};
