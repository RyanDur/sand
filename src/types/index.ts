export type Func<T = any, NewT = any> = (value: T) => NewT;
export type Predicate<T> = Func<T, boolean>;
export type Supplier<SUPPLY> = Func<void, SUPPLY>
export type Consumer<CONSUME> = Func<CONSUME, void>

export type Inspectable = {
    readonly inspect: Supplier<string>;
}
export type Suppliers<T> = {
    readonly orNull: Supplier<T | null>;
    readonly value: Supplier<T>;
}

export type AsyncSuppliers<T> = {
    readonly orNull: Supplier<Promise<T> | null>;
    readonly value: Supplier<Promise<T>>;
}

export type Id<T> = Suppliers<T> & {
    readonly orElse: Func<T, T>;
}

export type Functor<T> = Id<T> & {
    readonly map: <NewT>(f: Func<T, NewT>) => Functor<NewT>;
}
export type Monad<T> = Functor<T> & {
    readonly flatMap: <NewT>(f: Func<T, Monad<NewT>>) => Monad<NewT>;
}

export type BiFunctor<T, E> = Id<T | E> & {
    readonly map: <NewT extends T>(f: Func<T, NewT>) => BiFunctor<NewT, E>;
    readonly mapErr: <NewE extends E>(f: Func<E, NewE>) => BiFunctor<T, NewE>;
}

export type BiMonad<T, E> = BiFunctor<T, E> & {
    readonly flatMap: <NewT>(f: Func<T, BiMonad<NewT, E>>) => BiMonad<NewT, E>;
    readonly flatMapErr: <NewE>(f: Func<E, BiMonad<T, NewE>>) => BiMonad<T, NewE>;
}

export * from './Result';
export * from './Maybe';