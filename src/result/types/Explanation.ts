export type Explanation<T> = {
    readonly reason: T,
    readonly errors: Error[],
    readonly map: <U>(fn: (t: T, errors: Error[]) => U) => U
};