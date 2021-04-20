import {Explanation} from "./Explanation";

export type Ok<T> = {
    readonly isOk: true;
    readonly data: () => T;
    readonly map: <U>(fn: (t: T) => U) => U;
    readonly flatmap: <U>(fn: (t: Ok<T>) => Result<U, Explanation<T>>) => Result<U, Explanation<T>>;
}

export type Err<E> = {
    readonly isOk: false;
    readonly reason: () => E;
    readonly map: <U>(fn: (t: E) => U) => U;
    readonly flatmap: <T>(fn: (r: Err<E>) => Result<T, Explanation<E>>) => Result<T, Explanation<E>>;
}

export type Result<T, E> = Ok<T> | Err<E>;
