import {empty, has} from '../util';
import {Func, Head, MapFunc, ReducerFunc, Tail, VariadicFunc} from './types';

export const map: MapFunc = func => ([head, ...tail]) =>
    has(tail) ? [func(head), ...map(func)(tail) || []] : [func(head)];

export const reduce = <T, NewT>(callback: ReducerFunc<T, NewT>, start: NewT) => ([head, ...tail]: T[]): NewT =>
    has(head) ? reduce(callback, callback(start, head))(tail) : start;
export const reverse = <T>([head, ...tail]: T[]): T[] => empty(tail) ? [head] : [...reverse(tail), head];

export const filter = <T>(f: Func<T, boolean>) => ([head, ...tail]: T[] = []): T[] => {
    if (empty(head)) return [];
    return f(head) ? [head, ...filter(f)(tail)] : filter(f)(tail);
};

export const head: Head = (value: any): any => value[0];

export const tail: Tail = (value: any): any => value.slice(1);

const pipe = <T, NewT extends T>(...[head, ...tail]: VariadicFunc<T, NewT>[]): VariadicFunc<T, NewT> => arg =>
    reduce<Func<T, NewT>, NewT>((acc, fn) => fn(acc), head(arg))(tail);

const compose = <T, NewT extends T>(...fns: VariadicFunc<T, NewT>[]): VariadicFunc<T, NewT> => pipe(...reverse(fns));
