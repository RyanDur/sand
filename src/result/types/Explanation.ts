export type Explanation<T> = {
    readonly reason: T,
    readonly errors?: Error[]
};