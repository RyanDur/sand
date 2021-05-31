import {AsyncSuppliers, BiMonad, Consumer, Inspectable, Suppliers} from './index';

export declare namespace Result {
    type Ok<T, E> = BiMonad<T, E> & Suppliers<T> & Inspectable & {
        readonly isOk: true;
        readonly onOk: (consumer: Consumer<T>) => Ok<T, E>;
        readonly onErr: (consumer: Consumer<E>) => Ok<T, E>;
    }
    type Err<T, E> = BiMonad<T, E> & Suppliers<E> & Inspectable & {
        readonly isOk: false;
        readonly onOk: (consumer: Consumer<T>) => Err<T, E>;
        readonly onErr: (consumer: Consumer<E>) => Err<T, E>;
    }

    type Async<S, F> = Inspectable & {
        readonly value: () => Promise<Result<S, F>>;
        // readonly onSuccess: (consumer: Consumer<S>) => Async<S, F>;
        // readonly onFailure: (consumer: Consumer<F>) => Async<S, F>;
        readonly onComplete: (consumer: Consumer<Result<S, F>>) => Async<S, F>;
    }

    // interface Pipeline<S, F> {
    //     readonly value: () => Promise<Value<S, F>>;
    //     readonly inspect: () => string;
    //     readonly map: <NewS>(mapping: Mapping<S, NewS>) => Pipeline<NewS, F>;
    //     readonly mapFailure: <NewF>(mapping: Mapping<F, NewF>) => Pipeline<S, NewF>;
    //     readonly flatMap: <NewS>(mapping: Mapping<S, Pipeline<NewS, F>>) => Pipeline<NewS, F>;
    //     readonly flatMapFailure: <NewF>(mapping: Mapping<F, Pipeline<S, NewF>>) => Pipeline<S, NewF>;
    //     readonly onSuccess: (consumer: Consumer<S>) => Pipeline<S, F>;
    //     readonly onFailure: (consumer: Consumer<F>) => Pipeline<S, F>;
    //     readonly onComplete: (consumer: Consumer<Value<S, F>>) => Pipeline<S, F>;
    // }

    // BUG: https://github.com/typescript-eslint/typescript-eslint/issues/2237
    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace Async {
        interface RejectionError {
            readonly reason: unknown
        }
    }
}

export type Result<T, E> = Result.Ok<T, E> | Result.Err<T, E>;