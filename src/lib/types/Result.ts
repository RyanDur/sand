import {Consumer} from './Function';
import {Maybe} from './Maybe';

export type Result<VALUE, ERROR> = Result.Ok<VALUE, ERROR> | Result.Err<VALUE, ERROR>;

export declare namespace Result {
    interface Ok<VALUE, ERROR> {
        readonly isOk: true;
        readonly value: VALUE;
        readonly orNull: () => VALUE;
        readonly orElse: (fallback: VALUE) => VALUE;
        readonly map: <NEW_VALUE>(mapper: (value: VALUE) => NEW_VALUE) => Ok<NEW_VALUE, ERROR>;
        readonly mBind: <NEW_VALUE>(mapper: (value: VALUE) => Result<NEW_VALUE, ERROR>) => Result<NEW_VALUE, ERROR>;
        readonly or: (mapper: (reason: ERROR) => Result<VALUE, ERROR>) => Ok<VALUE, ERROR>;
        readonly either: <NEW_VALUE>(
            okF: (value: VALUE) => Result<NEW_VALUE, ERROR>,
            errF: (value: VALUE) => Result<VALUE, ERROR>
        ) => Result<NEW_VALUE, ERROR>
        readonly onOk: (consumer: Consumer<VALUE>) => Ok<VALUE, ERROR>;
        readonly onErr: (consumer: Consumer<ERROR>) => Ok<VALUE, ERROR>;
        readonly inspect: () => string;
        readonly toMaybe: () => Maybe<VALUE>
    }

    interface Err<VALUE, ERROR> {
        readonly isOk: false;
        readonly value: ERROR;
        readonly orNull: () => null;
        readonly orElse: (fallback: VALUE) => VALUE;
        readonly map: <NEW_VALUE = VALUE>(mapper: (value: VALUE) => NEW_VALUE) => Err<NEW_VALUE, ERROR>;
        readonly mBind: (mapper: (value: VALUE) => Result<VALUE, ERROR>) => Err<VALUE, ERROR>;
        readonly or: <NEW_ERROR>(mapper: (reason: ERROR) => Result<VALUE, NEW_ERROR>) => Result<VALUE, NEW_ERROR>;
        readonly either: <NEW_ERROR>(
            okF: (value: ERROR) => Result<VALUE, ERROR>,
            errF: (value: ERROR) => Result<VALUE, NEW_ERROR>
        ) => Result<VALUE, NEW_ERROR>
        readonly onOk: (consumer: Consumer<VALUE>) => Err<VALUE, ERROR>;
        readonly onErr: (consumer: Consumer<ERROR>) => Err<VALUE, ERROR>;
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
