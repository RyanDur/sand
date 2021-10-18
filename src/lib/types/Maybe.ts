import {Supplier} from './Function';

export interface Maybe<T> {
    readonly isNothing: boolean;
    readonly orElse: (fallback: T) => T;
    readonly orNull: Supplier<T | null>;
    readonly map: <NewT>(f: (value: T) => NewT) => Maybe<NewT>;
    readonly flatMap: <NewT>(f: (value: T) => Maybe<NewT>) => Maybe<NewT>;
    readonly inspect: Supplier<string>;
}