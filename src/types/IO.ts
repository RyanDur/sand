import {Func, Supplier} from './index';

export interface IO<T> {
    readonly perform: Supplier<T>;
    readonly orElse: Func<T, T>;
    readonly map: <NewT>(f: Func<T, NewT>) => IO<NewT>;
    readonly flatMap: <NewT>(f: Func<T, IO<NewT>>) => IO<NewT>;
    readonly inspect: Supplier<string>;
}