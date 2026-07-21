import {Consumer} from './Function';
import {Nothing, Some} from './Maybe';

export type Result<VALUE, ERROR> = Success<VALUE, ERROR> | Failure<VALUE, ERROR>;

/**
 * A Result is either a {@link Success} or a {@link Failure}. Both variants are
 * parameterized by BOTH the value and error types so that a chain tracks them
 * precisely: `mBind` unions the error type as new failures are introduced, `or`
 * unions the value type as failures recover, and neither ever widens to `unknown`.
 */
export interface Success<VALUE, ERROR> {
  readonly isSuccess: true;
  readonly value: VALUE;
  orNull(): VALUE;
  orElse<FALLBACK>(fallback: FALLBACK): VALUE;
  map<NEW_VALUE>(fn: (value: VALUE) => NEW_VALUE): Success<NEW_VALUE, ERROR>;
  mBind<NEW_VALUE, NEW_ERROR>(fn: (value: VALUE) => Result<NEW_VALUE, NEW_ERROR>): Result<NEW_VALUE, ERROR | NEW_ERROR>;
  or<NEW_ERROR, NEW_VALUE>(fn: (reason: ERROR) => Result<NEW_VALUE, NEW_ERROR>): Result<VALUE | NEW_VALUE, NEW_ERROR>;
  either<ON_SUCCESS, ON_FAILURE>(onSuccess: (value: VALUE) => ON_SUCCESS, onFailure: (reason: ERROR) => ON_FAILURE): ON_SUCCESS | ON_FAILURE;
  onSuccess(consumer: Consumer<VALUE>): Result<VALUE, ERROR>;
  onFailure(consumer: Consumer<ERROR>): Result<VALUE, ERROR>;
  onComplete(consumer: Consumer<Result<VALUE, ERROR>>): Result<VALUE, ERROR>;
  toMaybe(): Some<VALUE>;
  inspect(): string;
}

export interface Failure<VALUE, ERROR> {
  readonly isSuccess: false;
  readonly reason: ERROR;
  orNull(): null;
  orElse<FALLBACK>(fallback: FALLBACK): FALLBACK;
  map<NEW_VALUE>(fn: (value: VALUE) => NEW_VALUE): Failure<NEW_VALUE, ERROR>;
  mBind<NEW_VALUE, NEW_ERROR>(fn: (value: VALUE) => Result<NEW_VALUE, NEW_ERROR>): Result<NEW_VALUE, ERROR | NEW_ERROR>;
  or<NEW_ERROR, NEW_VALUE>(fn: (reason: ERROR) => Result<NEW_VALUE, NEW_ERROR>): Result<VALUE | NEW_VALUE, NEW_ERROR>;
  either<ON_SUCCESS, ON_FAILURE>(onSuccess: (value: VALUE) => ON_SUCCESS, onFailure: (reason: ERROR) => ON_FAILURE): ON_SUCCESS | ON_FAILURE;
  onSuccess(consumer: Consumer<VALUE>): Result<VALUE, ERROR>;
  onFailure(consumer: Consumer<ERROR>): Result<VALUE, ERROR>;
  onComplete(consumer: Consumer<Result<VALUE, ERROR>>): Result<VALUE, ERROR>;
  toMaybe(): Nothing;
  inspect(): string;
}

export declare namespace Result {
  /**
   * The AsyncResult is something that [Damien LeBerrigaud](https://github.com/dam5s) has introduced me to. I had the chance
   * to work with him on a project that inspired me to write this lib. Together we
   * collaborated on [React Redux Starter](https://github.com/dam5s/react-redux-starter) to aid us in developing future projects with
   * clients.
   *
   * The type allows you to work with a promise in the same way you would work with a Result, with some extra helpers.
   *
   * A factory for creating AsyncResult's
   *
   * @see Implementation:  {@link https://github.com/RyanDur/sand/blob/main/src/lib/asyncResult.ts}
   * @see Test: {@link https://github.com/RyanDur/sand/blob/main/src/lib/__tests__/asyncResult.spec.ts}
   * */
  interface Async<SUCCESS, FAILURE> {
    readonly value: Promise<Result<SUCCESS, FAILURE>>;
    readonly orNull: () => Promise<SUCCESS | null>;
    readonly orElse: <FALLBACK>(fallback: FALLBACK) => Promise<SUCCESS | FALLBACK>;
    readonly map: <U>(f: (value: SUCCESS) => U) => Async<U, FAILURE>;
    readonly mBind: <U, NEW_FAILURE>(f: (value: SUCCESS) => Async<U, NEW_FAILURE>) => Async<U, FAILURE | NEW_FAILURE>;
    readonly or: <NEW_FAILURE, U>(f: (value: FAILURE) => Async<U, NEW_FAILURE>) => Async<SUCCESS | U, NEW_FAILURE>;
    readonly either: <NS, NF>(
      onSuccess: (value: SUCCESS) => Async<NS, NF>,
      onFailure: (value: FAILURE) => Async<NS, NF>
    ) => Async<NS, NF>;
    /**
     * onPending: A function that notifies the consuming function of the pending state.
     *
     * <p>Upon invocation it will pass true to the consumer.
     * Once the call has finished it will pass false to the consumer.</p>
     *
     * @remarks
     * The provided consumer gets called twice.
     *
     * @param f - consumes the pending state.
     * */
    readonly onPending: (f: (waiting: boolean) => void) => Async<SUCCESS, FAILURE>;
    readonly onSuccess: (f: (value: SUCCESS) => void) => Async<SUCCESS, FAILURE>;
    readonly onFailure: (f: (value: FAILURE) => void) => Async<SUCCESS, FAILURE>;
    readonly onComplete: (f: (value: Result<SUCCESS, FAILURE>) => void) => Async<SUCCESS, FAILURE>;
    readonly inspect: () => Promise<string>;
  }
}
