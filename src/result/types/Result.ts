export type Ok<T> = {
    readonly isOk: true;
    readonly data: () => T;
    readonly map: <U>(fn: (t: T) => U) => U;
    readonly flatmap: <U, E>(fn: (t: Ok<T>) => Result<U, E>) => Result<U, E>;
}

export type Err<E> = {
    readonly isOk: false;
    readonly reason: () => E;
    readonly map: <U>(fn: (t: E) => U) => U;
    readonly flatmap: <T, U>(fn: (r: Err<E>) => Result<T, U>) => Result<T, U>;
}

export type Result<T, E> = Ok<T> | Err<E>;
