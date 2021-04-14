export type Ok<T> = {
    readonly isOk: true;
    readonly map: <U>(fn: (t: T) => U) => U;
    readonly flatmap: <U, E>(fn: (t: Result<T, E>) => Result<U, E>) => Result<U, E>;
}

export type Err<E> = {
    readonly isOk: false;
    readonly map: <U>(fn: (t: E) => U) => U;
    readonly flatmap: <T, U>(fn: (t: Result<T, E>) => Result<T, U>) => Result<T, U>;
}

export type Result<T, E> = Ok<T> | Err<E>;
