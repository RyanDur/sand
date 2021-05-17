import {Consumer, Mapping} from './index';

export declare namespace Result {
    interface Ok<T> {
        readonly isOk: true;
        readonly data: T;
    }

    interface Err<E> {
        readonly isOk: false;
        readonly explanation: E;
    }

    interface Pipeline<S, E> {
        readonly value: () => Value<S, E>;
        readonly orElse: (fallback: S) => S;
        readonly orNull: () => S | null;
        readonly onOk: (consumer: Consumer<S>) => Pipeline<S, E>;
        readonly onErr: (consumer: Consumer<E>) => Pipeline<S, E>;
        readonly map: <NewS>(mapping: Mapping<S, NewS>) => Pipeline<NewS, E>;
        readonly mapError: <NewE>(mapping: Mapping<E, NewE>) => Pipeline<S, NewE>;
        readonly flatMap: <NewS>(mapping: Mapping<S, Value<NewS, E>>) => Pipeline<NewS, E>;
        readonly flatMapError: <NewE>(mapping: Mapping<E, Value<S, NewE>>) => Pipeline<S, NewE>;
    }

    type Value<T, E> = Ok<T> | Err<E>

    namespace Async {
        interface RejectionError {
            readonly reason: unknown
        }

        interface Pipeline<S, F> {
            readonly value: () => Promise<Value<S, F>>
            readonly map: <NewS>(mapping: Mapping<S, NewS>) => Pipeline<NewS, F>
            readonly mapFailure: <NewF>(mapping: Mapping<F, NewF>) => Pipeline<S, NewF>
            readonly flatMap: <NewS>(mapping: Mapping<S, Pipeline<NewS, F>>) => Pipeline<NewS, F>
            readonly flatMapFailure: <NewF>(mapping: Mapping<F, Pipeline<S, NewF>>) => Pipeline<S, NewF>
            readonly onSuccess: (consumer: Consumer<S>) => Pipeline<S, F>
            readonly onFailure: (consumer: Consumer<F>) => Pipeline<S, F>
            readonly onComplete: (consumer: Consumer<Value<S, F>>) => Pipeline<S, F>
        }
    }
}