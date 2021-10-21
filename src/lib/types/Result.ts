import {Consumer, Supplier} from './Function';

export type Result<DATA, REASON> = Result.Ok<DATA, REASON> | Result.Err<DATA, REASON>;

/**
 * @internal
 * */
interface _Result<DATA, REASON> {
    readonly orNull: Supplier<DATA | null>;
    readonly orElse: (fallback: DATA) => DATA;
    readonly errOrElse: (fallback: REASON) => REASON;
    readonly map: <NEW_DATA>(mapper: (data: DATA) => NEW_DATA) => Result<NEW_DATA, REASON>;
    readonly mapErr: <NEW_REASON>(mapper: (reason: REASON) => NEW_REASON) => Result<DATA, NEW_REASON>;
    readonly flatMap: <NEW_DATA>(mapper: (data: DATA) => Result<NEW_DATA, REASON>) => Result<NEW_DATA, REASON>;
    readonly flatMapErr: <NEW_REASON>(mapper: (reason: REASON) => Result<DATA, NEW_REASON>) => Result<DATA, NEW_REASON>;
    readonly onOk: (consumer: Consumer<DATA>) => Result<DATA, REASON>;
    readonly onErr: (consumer: Consumer<REASON>) => Result<DATA, REASON>;
    readonly inspect: Supplier<string>;
}

export declare namespace Result {
    interface Ok<DATA, REASON> extends _Result<DATA, REASON> {
        readonly isOk: true;
        readonly data: DATA;
    }

    interface Err<DATA, REASON> extends _Result<DATA, REASON> {
        readonly isOk: false;
        readonly reason: REASON;
    }

    interface Async<SUCCESS, FAILURE> {
        readonly orNull: Supplier<Promise<SUCCESS | null>>;
        readonly orElse: (fallback: SUCCESS) => Promise<SUCCESS>;
        readonly failureOrElse: (fallback: FAILURE) => Promise<FAILURE>;
        readonly map: <NEW_SUCCESS>(mapping: (data: SUCCESS) => NEW_SUCCESS) => Async<NEW_SUCCESS, FAILURE>;
        readonly mapFailure: <NEW_FAILURE>(mapping: (reason: FAILURE) => NEW_FAILURE) => Async<SUCCESS, NEW_FAILURE>;
        readonly flatMap: <NEW_SUCCESS>(mapping: (data: SUCCESS) => Async<NEW_SUCCESS, FAILURE>) => Async<NEW_SUCCESS, FAILURE>;
        readonly flatMapFailure: <NEW_FAILURE>(mapping: (reason: FAILURE) => Async<SUCCESS, NEW_FAILURE>) => Async<SUCCESS, NEW_FAILURE>;
        /**
         * A function that notifies the consuming function of the pending state.
         *
         * <p>Upon invocation it will pass true to the consumer.
         * Once the call has finished it will pass false to the consumer.</p>
         *
         * @remarks
         * The provided consumer gets called twice.
         *
         * @param consumer - consumes the loading state.
         * */
        readonly onPending: (consumer: Consumer<boolean>) => Async<SUCCESS, FAILURE>;
        readonly onSuccess: (consumer: Consumer<SUCCESS>) => Async<SUCCESS, FAILURE>;
        readonly onFailure: (consumer: Consumer<FAILURE>) => Async<SUCCESS, FAILURE>;
        readonly onComplete: (consumer: Consumer<Result<SUCCESS, FAILURE>>) => Async<SUCCESS, FAILURE>;
        readonly inspect: Supplier<string>;
    }
}
