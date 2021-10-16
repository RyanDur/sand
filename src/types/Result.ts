import {Consumer, Func, Supplier} from '../function/types';

export type Result<T, E> = (Result.Ok<T> | Result.Err<E>) & {
    readonly orElse: Func<T, T>;
    readonly orElseErr: Func<E, E>;
    readonly orNull: Supplier<T | null>;
    readonly map: <NewT>(f: Func<T, NewT>) => Result<NewT, E>;
    readonly mapErr: <NewE>(f: Func<E, NewE>) => Result<T, NewE>;
    readonly flatMap: <NewT>(f: Func<T, Result<NewT, E>>) => Result<NewT, E>;
    readonly flatMapErr: <NewE>(f: Func<E, Result<T, NewE>>) => Result<T, NewE>;
    readonly onOk: Func<Consumer<T>, Result<T, E>>;
    readonly onErr: Func<Consumer<E>, Result<T, E>>;
    readonly inspect: Supplier<string>;
}

export declare namespace Result {
    type Ok<T> = {
        readonly isOk: true;
        readonly data: T;
    }

    type Err<E> = {
        readonly isOk: false;
        readonly explanation: E;
    }

    type Async<S, F> = {
        readonly value: Supplier<Promise<Result<S, F>>>;
        readonly orElse: Func<S, Promise<S>>;
        readonly map: <NewS>(mapping: Func<S, NewS>) => Async<NewS, F>;
        readonly mapFailure: <NewF>(mapping: Func<F, NewF>) => Async<S, NewF>;
        readonly flatMap: <NewS>(mapping: Func<S, Async<NewS, F>>) => Async<NewS, F>;
        readonly flatMapFailure: <NewF>(mapping: Func<F, Async<S, NewF>>) => Async<S, NewF>;
        readonly onSuccess: Func<Consumer<S>, Async<S, F>>;
        readonly onFailure: Func<Consumer<F>, Async<S, F>>;
        readonly onComplete: Func<Consumer<Result<S, F>>, Async<S, F>>;
        readonly onLoading: Func<Consumer<boolean>, Async<S, F>>;
        readonly inspect: Supplier<string>;
    }
}
