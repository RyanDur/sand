import {failure as err, success as ok} from './result';
import {Result} from './types';
import {inspect} from './util';

const ofPromise = <SUCCESS, FAILURE>(promise: Promise<Result<SUCCESS, FAILURE>>): Result.Async<SUCCESS, FAILURE> => ({
  value: promise,
  orNull: () => promise.then(result => result.orNull()),
  orElse: <FALLBACK>(fallback: FALLBACK): Promise<SUCCESS | FALLBACK> => promise.then(result => result.orElse(fallback)),
  map: fn => ofPromise(promise.then(result => result.map(fn))),
  mBind: <U, NEW_FAILURE>(fn: (value: SUCCESS) => Result.Async<U, NEW_FAILURE>) => ofPromise<U, FAILURE | NEW_FAILURE>(promise.then<Result<U, FAILURE | NEW_FAILURE>>(result => result.isSuccess ? fn(result.value).value : err<FAILURE | NEW_FAILURE, U>(result.reason))),
  or: <NEW_FAILURE, U>(fn: (reason: FAILURE) => Result.Async<U, NEW_FAILURE>) => ofPromise<SUCCESS | U, NEW_FAILURE>(promise.then<Result<SUCCESS | U, NEW_FAILURE>>(result => result.isSuccess ? ok<SUCCESS | U, NEW_FAILURE>(result.value) : fn(result.reason).value)),
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
 * {@link https://github.com/RyanDur/sand/blob/main/src/lib/asyncResult.ts | Implementation}
 * ```ts
 * const successfulResult = asyncSuccess('some value').map(value => value + ', another value');
 * await successfulResult.orNull(); // produces: "some value, another value"
 * await successfulResult.orElse('fallback'); // produces: "some value, another value" (orElse returns the value for a success)
 * ```
 * */
export const asyncSuccess = <S, F = never>(value: S): Result.Async<S, F> => ofPromise<S, F>(Promise.resolve(ok<S, F>(value)));

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
