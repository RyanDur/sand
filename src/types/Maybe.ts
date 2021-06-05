import {Func, Supplier} from '../function/types';

export declare namespace Maybe {
    type Some<T> = {
        readonly isNone: false;
        readonly value: Supplier<T>;
        readonly orElse: Func<T, T>;
        readonly orNull: Supplier<T | null>;
        readonly map: <NewT>(f: Func<T, NewT>) => Maybe<NewT>;
        readonly flatMap: <NewT>(f: Func<T, Maybe<NewT>>) => Maybe<NewT>;
        readonly inspect: Supplier<string>;
    };
    type None<T> = {
        readonly isNone: true;
        readonly value: Supplier<null>;
        readonly orElse: Func<T, T>;
        readonly orNull: Supplier<T | null>;
        readonly map: <NewT>(f: Func<T, NewT>) => Maybe<T>;
        readonly flatMap: <NewT>(f: Func<T, Maybe<NewT>>) => Maybe<T>;
        readonly inspect: Supplier<string>;
    };
}

export type Maybe<T> = Maybe.Some<T> | Maybe.None<T>;