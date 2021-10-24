import {Supplier} from '../../lib/types';

export interface IO<T> {
    readonly perform: Supplier<T>;
    readonly orElse: (fallback: T) => T;
    readonly map: <NewT>(f: (fallback: T) => NewT) => IO<NewT>;
    readonly flatMap: <NewT>(f: (fallback: T) => IO<NewT>) => IO<NewT>;
    readonly inspect: Supplier<string>;
}