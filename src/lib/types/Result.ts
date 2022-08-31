import {Consumer} from './Function';
import {Nothing, Some} from './Maybe';

export type Result<VALUE, ERROR> = Success<VALUE> | Failure<ERROR>;

export interface Success<VALUE> {
  readonly isSuccess: true;
  readonly value: VALUE;
  readonly orNull: () => VALUE;
  readonly orElse: (fallback: unknown) => VALUE;
  readonly map: <NEW_VALUE>(mapper: (value: VALUE) => NEW_VALUE) => Success<NEW_VALUE>;
  readonly mBind: <NEW_VALUE>(binder: (value: VALUE) => Result<NEW_VALUE, NEW_VALUE>) => Result<NEW_VALUE, NEW_VALUE>;
  readonly or: (binder: unknown) => Success<VALUE>;
  readonly either: <NEW_VALUE>(
      successF: (value: VALUE) => Result<NEW_VALUE, NEW_VALUE>,
      failureF: unknown
  ) => Result<NEW_VALUE, NEW_VALUE>;
  readonly onSuccess: (consumer: Consumer<VALUE>) => Success<VALUE>;
  readonly onFailure: (consumer: unknown) => Success<VALUE>;
  readonly inspect: () => string;
  readonly toMaybe: () => Some<VALUE>;
}

export interface Failure<ERROR> {
  readonly isSuccess: false;
  readonly value: ERROR;
  readonly orNull: () => null;
  readonly orElse: <VALUE>(fallback: VALUE) => VALUE;
  readonly map: (mapper: unknown) => Failure<ERROR>;
  readonly mBind: (binder: unknown) => Failure<ERROR>;
  readonly or: <NEW_ERROR>(mapper: (reason: ERROR) => Result<NEW_ERROR, NEW_ERROR>) => Result<NEW_ERROR, NEW_ERROR>;
  readonly either: <NEW_ERROR>(
      successF: unknown,
      failureF: (error: ERROR) => Result<NEW_ERROR, NEW_ERROR>
  ) => Result<NEW_ERROR, NEW_ERROR>;
  readonly onSuccess: (consumer: unknown) => Failure<ERROR>;
  readonly onFailure: (consumer: Consumer<ERROR>) => Failure<ERROR>;
  readonly toMaybe: () => Nothing;
  readonly inspect: () => string;
}

export declare namespace Result {
  interface Async<SUCCESS, FAILURE> {
    readonly value: Promise<SUCCESS | FAILURE>;
    readonly orNull: () => Promise<SUCCESS | null>;
    readonly orElse: (fallback: SUCCESS) => Promise<SUCCESS>;
    readonly map: <NEW_SUCCESS>(mapping: (data: SUCCESS) => NEW_SUCCESS) => Result.Async<NEW_SUCCESS, FAILURE>;
    readonly mBind: <NEW_SUCCESS>(mapping: (data: SUCCESS) => Result.Async<NEW_SUCCESS, FAILURE>) => Result.Async<NEW_SUCCESS, FAILURE>;
    readonly or: <NEW_FAILURE>(mapping: (reason: FAILURE) => Result.Async<SUCCESS, NEW_FAILURE>) => Result.Async<SUCCESS, NEW_FAILURE>;
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
    readonly onPending: (consumer: Consumer<boolean>) => Result.Async<SUCCESS, FAILURE>;
    readonly onSuccess: (consumer: Consumer<SUCCESS>) => Result.Async<SUCCESS, FAILURE>;
    readonly onFailure: (consumer: Consumer<FAILURE>) => Result.Async<SUCCESS, FAILURE>;
    readonly onComplete: (consumer: Consumer<Result<SUCCESS, FAILURE>>) => Result.Async<SUCCESS, FAILURE>;
    readonly inspect: () => Promise<string>;
  }
}
