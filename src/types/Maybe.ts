import {Func, Supplier} from '../function/types';

export type Maybe<T> = {
    readonly isNothing: boolean;
    readonly orElse: Func<T, T>;
    readonly orNull: Supplier<T | null>;
    readonly map: <NewT>(f: Func<T, NewT>) => Maybe<NewT>;
    readonly flatMap: <NewT>(f: Func<T, Maybe<NewT>>) => Maybe<NewT>;
    readonly inspect: Supplier<string>;
};