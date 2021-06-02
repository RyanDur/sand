import {Consumer, Func, Supplier} from './index';

export declare namespace Result {
    type Ok<T, E> = {
        readonly isOk: true;
        readonly orElse: Func<T, T>;
        readonly orElseErr: Func<E, E>;
        readonly orNull: Supplier<T | null>;
        readonly map: <NewT>(f: Func<T, NewT>) => Result<NewT, E>;
        readonly mapErr: <NewE>(f: Func<E, NewE>) => Result<T, NewE>;
        readonly flatMap: <NewT>(f: Func<T, Result<NewT, E>>) => Result<NewT, E>;
        readonly flatMapErr: <NewE>(f: Func<E, Result<T, NewE>>) => Result<T, NewE>;
        readonly onOk: (consumer: Consumer<T>) => Ok<T, E>;
        readonly onErr: (consumer: Consumer<E>) => Ok<T, E>;
        readonly inspect: Supplier<string>;
    }

    type Err<T, E> = {
        readonly isOk: false;
        readonly orElse: Func<T, T>;
        readonly orElseErr: Func<E, E>;
        readonly orNull: Supplier<E | null>;
        readonly map: <NewT>(f: Func<T, NewT>) => Result<NewT, E>;
        readonly mapErr: <NewE>(f: Func<E, NewE>) => Result<T, NewE>;
        readonly flatMap: <NewT>(f: Func<T, Result<NewT, E>>) => Result<NewT, E>;
        readonly flatMapErr: <NewE>(f: Func<E, Result<T, NewE>>) => Result<T, NewE>;
        readonly onOk: (consumer: Consumer<T>) => Err<T, E>;
        readonly onErr: (consumer: Consumer<E>) => Err<T, E>;
        readonly inspect: Supplier<string>;
    }

    type Async<S, F> = {
        readonly orElse: (fallback: S) => Promise<S>;
        readonly orElseFailure: (fallback: F) => Promise<F>;
        readonly map: <NewS>(mapping: Func<S, NewS>) => Async<NewS, F>;
        readonly mapFailure: <NewF>(mapping: Func<F, NewF>) => Async<S, NewF>;
        readonly flatMap: <NewS>(mapping: Func<S, Async<NewS, F>>) => Async<NewS, F>;
        readonly flatMapFailure: <NewF>(mapping: Func<F, Async<S, NewF>>) => Async<S, NewF>;
        readonly onSuccess: (consumer: Consumer<S>) => Async<S, F>;
        readonly onFailure: (consumer: Consumer<F>) => Async<S, F>;
        readonly onComplete: (consumer: Consumer<Result<S, F>>) => Async<S, F>;
        readonly inspect: Supplier<string>;
    }
}

export type Result<T, E> = Result.Ok<T, E> | Result.Err<T, E>;
