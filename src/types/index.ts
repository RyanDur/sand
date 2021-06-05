// export type Suppliers<T> = {
//     readonly orNull: Supplier<T | null>;
// }
//
// export type Id<T> = {
//     readonly orElse: Func<T, T>;
// }
// export type Functor<T> = {
//     readonly orElse: Func<T, T>;
//     readonly map: <NewT>(f: Func<T, NewT>) => Functor<NewT>;
// }
// export type Monad<T> = {
//     readonly orElse: Func<T, T>;
//     readonly map: <NewT>(f: Func<T, NewT>) => Monad<NewT>;
//     readonly flatMap: <NewT>(f: Func<T, Monad<NewT>>) => Monad<NewT>;
// }
//
// export type BiId<T, E> = {
//     readonly orElse: Func<T, T>;
//     readonly orElseErr: Func<E, E>;
// }
// export type BiFMap<T, E> = {
//     readonly map: <NewT>(f: Func<T, NewT>) => BiFunctor<NewT, E>;
//     readonly mapErr: <NewE>(f: Func<E, NewE>) => BiFunctor<T, NewE>;
// }
// export type BiFunctor<T, E> = {
//     readonly orElse: Func<T, T>;
//     readonly orElseErr: Func<E, E>;
//     readonly map: <NewT>(f: Func<T, NewT>) => BiFunctor<NewT, E>;
//     readonly mapErr: <NewE>(f: Func<E, NewE>) => BiFunctor<T, NewE>;
// }
//
// export type BiMonad<T, E> = {
//     readonly orElse: Func<T, T>;
//     readonly orElseErr: Func<E, E>;
//     readonly map: <NewT>(f: Func<T, NewT>) => BiMonad<NewT, E>;
//     readonly mapErr: <NewE>(f: Func<E, NewE>) => BiMonad<T, NewE>;
//     readonly flatMap: <NewT>(f: Func<T, BiMonad<NewT, E>>) => BiMonad<NewT, E>;
//     readonly flatMapErr: <NewE>(f: Func<E, BiMonad<T, NewE>>) => BiMonad<T, NewE>;
// }

import {Supplier} from '../function/types';

export type Inspectable = {
    readonly inspect: Supplier<string>;
}

export * from './Result';
export * from './Maybe';