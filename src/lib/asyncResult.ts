import {failure as err, success as ok} from './result';
import {Result} from './types';
import {inspect} from './util';

type Halt = { stopped: boolean; release?: (() => void) | undefined };

const cancelable = (halt: Halt) => {
  const chain = <SUCCESS, FAILURE>(promise: Promise<Result<SUCCESS, FAILURE>>): Result.Async<SUCCESS, FAILURE> => ({
    value: promise,
    orNull: () => promise.then(result => result.orNull()),
    orElse: fallback => promise.then(result => result.orElse(fallback)),
    map: fn => chain(promise.then(result => result.map(fn))),
    mBind: <U, NEW_FAILURE>(fn: (value: SUCCESS) => Result.Async<U, NEW_FAILURE>) => chain(promise.then<Result<U, FAILURE | NEW_FAILURE>>(result => result.isSuccess ? fn(result.value).value : err(result.reason))),
    or: <NEW_FAILURE, U>(fn: (reason: FAILURE) => Result.Async<U, NEW_FAILURE>) => chain(promise.then<Result<SUCCESS | U, NEW_FAILURE>>(result => result.isSuccess ? ok(result.value) : fn(result.reason).value)),
    either: (onSuccess, onFailure) => chain(promise.then(result => result.isSuccess
      ? onSuccess(result.value).value
      : onFailure(result.reason).value)),
    onPending: (waiting) => {
      if (!halt.stopped) waiting(true);
      return chain(promise.then((result) => halt.stopped ? result : result.onComplete(() => {
        if (!halt.stopped) waiting(false);
      })));
    },
    onSuccess: consumer => chain(promise.then(result => halt.stopped ? result : result.onSuccess(value => {
      if (!halt.stopped) consumer(value);
    }))),
    onFailure: consumer => chain(promise.then(result => halt.stopped ? result : result.onFailure(reason => {
      if (!halt.stopped) consumer(reason);
    }))),
    onComplete: consumer => chain(promise.then(result => halt.stopped ? result : result.onComplete(settled => {
      if (!halt.stopped) consumer(settled);
    }))),
    onCancel: release => {
      if (halt.stopped) release();
      else {
        const prior = halt.release;
        halt.release = prior ? () => {
          prior();
          release();
        } : release;
      }
      return chain(promise);
    },
    cancel: () => {
      halt.stopped = true;
      halt.release?.();
      halt.release = undefined;
    },
    inspect: () => promise.then(value => `Result.Async(${inspect(value)})`)
  });
  return chain;
};

const ofPromise = <SUCCESS, FAILURE>(promise: Promise<Result<SUCCESS, FAILURE>>): Result.Async<SUCCESS, FAILURE> =>
  cancelable({stopped: false})(promise);

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
export const asyncFailure = <F, S = never>(value: F): Result.Async<S, F> => ofPromise<S, F>(Promise.resolve(err<F, S>(value)));

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


