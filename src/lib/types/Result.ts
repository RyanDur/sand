import {Consumer} from './Function';
import {Nothing, Some} from './Maybe';

export type Result<VALUE, ERROR> = Success<VALUE> | Failure<ERROR>;

export interface Success<VALUE> {
  readonly isSuccess: true;
  readonly identity: VALUE;
  readonly orNull: () => VALUE;
  readonly orElse: (fallback: unknown) => VALUE;
  readonly map: <NEW_VALUE>(fn: (value: VALUE) => NEW_VALUE) => Success<NEW_VALUE>;
  readonly mBind: <NEW_VALUE>(fn: (value: VALUE) => Result<NEW_VALUE, unknown>) => Result<NEW_VALUE, unknown>;
  readonly or: (fn: unknown) => Success<VALUE>;
  readonly either: <NEW_VALUE, ERROR>(
    onSuccess: (value: VALUE) => Result<NEW_VALUE, ERROR>,
    onFailure: unknown
  ) => Result<NEW_VALUE, ERROR>;
  readonly onSuccess: (consumer: Consumer<VALUE>) => Success<VALUE>;
  readonly onFailure: (consumer: unknown) => Success<VALUE>;
  readonly onComplete: (consumer: Consumer<Success<VALUE>>) => Success<VALUE>;
  readonly inspect: () => string;
  readonly toMaybe: () => Some<VALUE>;
}

export interface Failure<ERROR> {
  readonly isSuccess: false;
  readonly identity: ERROR;
  readonly orNull: () => null;
  readonly orElse: <VALUE>(fallback: VALUE) => VALUE;
  readonly map: (fn: unknown) => Failure<ERROR>;
  readonly mBind: (fn: unknown) => Failure<ERROR>;
  readonly or: <NEW_ERROR>(fn: (reason: ERROR) => Result<unknown, NEW_ERROR>) => Result<unknown, NEW_ERROR>;
  readonly either: <VALUE, NEW_ERROR>(
    onSuccess: unknown,
    onFailure: (err: ERROR) => Result<VALUE, NEW_ERROR>
  ) => Result<VALUE, NEW_ERROR>;
  readonly onSuccess: (consumer: unknown) => Failure<ERROR>;
  readonly onFailure: (consumer: Consumer<ERROR>) => Failure<ERROR>;
  readonly onComplete: (consumer: Consumer<Failure<ERROR>>) => Failure<ERROR>;
  readonly toMaybe: () => Nothing;
  readonly inspect: () => string;
}

export declare namespace Result {
  interface Async<SUCCESS, FAILURE> {
    readonly identity: Promise<Result<SUCCESS, FAILURE>>;
    readonly orNull: () => Promise<SUCCESS | null>;
    readonly orElse: (fallback: SUCCESS) => Promise<SUCCESS>;
    readonly map: <U>(f: (value: SUCCESS) => U) => Async<U, FAILURE>;
    readonly mBind: <U>(f: (value: SUCCESS) => Async<U, FAILURE>) => Async<U, FAILURE>;
    readonly or: <U>(f: (value: FAILURE) => Async<SUCCESS, U>) => Async<SUCCESS, U>;
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
     * @param consumer - consumes the pending state.
     * */
    readonly onPending: (f: (waiting: boolean) => void) => Async<SUCCESS, FAILURE>;
    readonly onSuccess: (f: (value: SUCCESS) => void) => Async<SUCCESS, FAILURE>;
    readonly onFailure: (f: (value: FAILURE) => void) => Async<SUCCESS, FAILURE>;
    readonly onComplete: (f: (value: Result<SUCCESS, FAILURE>) => void) => Async<SUCCESS, FAILURE>;
    readonly inspect: () => Promise<string>;
  }
}
