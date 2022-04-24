import {Consumer} from './Function';
import {Maybe} from './Maybe';

export type Result<DATA, REASON> = Result.Ok<DATA, REASON> | Result.Err<DATA, REASON>;

export declare namespace Result {
    interface Ok<VALUE, REASON> {
        readonly isOk: true;
        readonly value: VALUE;
        readonly orNull: () => VALUE;
        readonly orElse: (fallback: VALUE) => VALUE;
        readonly map: <NEW_VALUE>(mapper: (value: VALUE) => NEW_VALUE) => Result<NEW_VALUE, REASON>;
        readonly mBind: <NEW_VALUE>(mapper: (value: VALUE) => Result<NEW_VALUE, REASON>) => Result<NEW_VALUE, REASON>;
        readonly or: <NEW_REASON>(mapper: (reason: REASON) => Result<VALUE, NEW_REASON>) => Result<VALUE, NEW_REASON>;
        readonly either: <NEW_VALUE>(
            okF: (value: VALUE) => Result<NEW_VALUE, REASON>,
            errF: (value: VALUE) => Result<VALUE, REASON>
        ) => Result<NEW_VALUE, REASON>
        readonly onOk: (consumer: Consumer<VALUE>) => Result<VALUE, REASON>;
        readonly onErr: (consumer: Consumer<REASON>) => Result<VALUE, REASON>;
        readonly inspect: () => string;
        readonly toMaybe: () => Maybe<VALUE>
    }

    interface Err<VALUE, REASON> {
        readonly isOk: false;
        readonly value: REASON;
        readonly orNull: () => null;
        readonly orElse: (fallback: VALUE) => VALUE;
        readonly map: <NEW_VALUE>(mapper: (value: VALUE) => NEW_VALUE) => Result<NEW_VALUE, REASON>;
        readonly mBind: <NEW_VALUE>(mapper: (value: VALUE) => Result<NEW_VALUE, REASON>) => Result<NEW_VALUE, REASON>;
        readonly or: <NEW_REASON>(mapper: (reason: REASON) => Result<VALUE, NEW_REASON>) => Result<VALUE, NEW_REASON>;
        readonly either: <NEW_REASON>(
            okF: (value: REASON) => Result<VALUE, REASON>,
            errF: (value: REASON) => Result<VALUE, NEW_REASON>
        ) => Result<VALUE, NEW_REASON>
        readonly onOk: (consumer: Consumer<VALUE>) => Result<VALUE, REASON>;
        readonly onErr: (consumer: Consumer<REASON>) => Result<VALUE, REASON>;
        readonly toMaybe: () => Maybe<VALUE>;
        readonly inspect: () => string;
    }

    interface Async<SUCCESS, FAILURE> {
        readonly value: Promise<Result<SUCCESS, FAILURE>>;
        readonly orNull: () => Promise<SUCCESS | null>;
        readonly orElse: (fallback: SUCCESS) => Promise<SUCCESS>;
        readonly map: <NEW_SUCCESS>(mapping: (data: SUCCESS) => NEW_SUCCESS) => Async<NEW_SUCCESS, FAILURE>;
        readonly mBind: <NEW_SUCCESS>(mapping: (data: SUCCESS) => Async<NEW_SUCCESS, FAILURE>) => Async<NEW_SUCCESS, FAILURE>;
        readonly or: <NEW_FAILURE>(mapping: (reason: FAILURE) => Async<SUCCESS, NEW_FAILURE>) => Async<SUCCESS, NEW_FAILURE>;
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
        readonly onPending: (consumer: Consumer<boolean>) => Async<SUCCESS, FAILURE>;
        readonly onSuccess: (consumer: Consumer<SUCCESS>) => Async<SUCCESS, FAILURE>;
        readonly onFailure: (consumer: Consumer<FAILURE>) => Async<SUCCESS, FAILURE>;
        readonly onComplete: (consumer: Consumer<Result<SUCCESS, FAILURE>>) => Async<SUCCESS, FAILURE>;
        readonly inspect: () => Promise<string>;
    }
}
