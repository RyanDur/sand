export type Explanation<T> = {
    readonly reason: T,
    readonly errors: Error[]
};

export type ResultCreator = <T, E>(aResult: ResultType<T, E>) => Result<T, E>
export type ResultType<T, E> = Ok<T> | Err<Explanation<E>>
export type Ok<T> = {
    readonly isOk: true;
    readonly data: T;
}
export type Err<E> = {
    readonly isOk: false;
    readonly explanation: E;
}

export interface Result<T, E> {
    readonly map: <NewT>(mapper: (aResult: Ok<T>) => ResultType<NewT, E>) => Result<NewT, E>;
    readonly mapError: <NewE>(mapper: (aResult: Err<Explanation<E>>) => ResultType<T, NewE>) => Result<T, NewE>;
    readonly orNull: () => ResultType<T, E> | null;
}
