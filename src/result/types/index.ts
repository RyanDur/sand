type Mapping<A, B> = (a: A) => B

export declare namespace Result {
    interface Ok<T> {
        readonly isOk: true;
        readonly data: T;
    }

    interface Err<E> {
        readonly isOk: false;
        readonly reason: E;
    }

    interface Pipeline<S, E> {
        readonly value: () => Value<S, E>;
        readonly orElse: (fallback: S) => S;
        readonly orNull: () => S | null;
        readonly map: <NewS>(mapping: Mapping<S, NewS>) => Pipeline<NewS, E>;
        readonly mapError: <NewE>(mapping: Mapping<E, NewE>) => Pipeline<S, NewE>;
        readonly flatMap: <NewS>(mapping: Mapping<S, Value<NewS, E>>) => Pipeline<NewS, E>;
        readonly flatMapError: <NewE>(mapping: Mapping<E, Value<S, NewE>>) => Pipeline<S, NewE>;
    }

    type Value<T, E> = Ok<T> | Err<E>
}