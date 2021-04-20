interface Mappable<T> {
    readonly flatmap: (fn: (t: T) => T) => T;
}

export type Ok<T> = {
    readonly isOk: true;
    readonly data: () => T;
    readonly map: <U>(fn: (t: T) => U) => U;
    readonly flatmap: <U>(fn: (t: Ok<T>) => U) => U;
}

export type Err<E> = {
    readonly isOk: false;
    readonly explanation: () => E;
    readonly map: <U>(fn: (t: E) => U) => U;
    readonly flatmap: <U>(fn: (t: Err<E>) => U) => U;
}

export type Result<T, E> = (Ok<T> | Err<E>)
