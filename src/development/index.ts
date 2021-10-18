import {empty, has} from '../lib';

export type MapFunc = <T, NewT>(func: (value: T) => NewT) => (values: T[]) => NewT[];
export type ReducerFunc<T, NewT> = (acc: NewT, value: T) => NewT;
export type Head = {
    (a: string): string;
    <T>(a: T[]): T;
}

export type Tail = {
    (a: string): string;
    <T>(a: T[]): T[];
}

type TailF<T extends any[]> = T extends [head: any, ...tail: infer Tail_]
    ? Tail_
    : never;

interface Take1_<T extends any[]> {
    type: T extends { 0: infer U } ? [U]
        : T extends { 0?: infer U } ? [U?]
            : never;
}

type Take1<T extends any[]> = Take1_<T>['type'];
type Curry<F extends (...args: any[]) => any,
    P extends any[] = Parameters<F>, // P: are the parameters of F
    R = ReturnType<F> // R: the return type of F
    > =
    Take1<TailF<P>> extends never
        ? F // F is () => any | (a: any) => any | (a: any, ...args: any[]) => any
        : (...args: Take1<P>) => Curry<(...args: TailF<P>) => R>;


export const map: MapFunc = func => ([head, ...tail]) =>
    has(tail) ? [func(head), ...map(func)(tail) || []] : [func(head)];

export const reduce = <T, NewT>(callback: ReducerFunc<T, NewT>, start: NewT) => ([head, ...tail]: T[]): NewT =>
    has(head) ? reduce(callback, callback(start, head))(tail) : start;
export const reverse = <T>([head, ...tail]: T[]): T[] => empty(tail) ? [head] : [...reverse(tail), head];

export const filter = <T>(f: (value: T) => boolean) => ([head, ...tail]: T[] = []): T[] => {
    if (empty(head)) return [];
    return f(head) ? [head, ...filter(f)(tail)] : filter(f)(tail);
};

export const head: Head = ([head]: any): any => head;
export const tail: Tail = (value: any): any => value.slice(1);

type InnerFunction<T extends unknown[], V> = (...args: T) => V;
type OuterFunction<V, W> = (arg: V) => W;

export const compose = <T extends unknown[], V, W>(
    outer: OuterFunction<V, W>,
    inner: InnerFunction<T, V>
) => (...innerParams: T): W => outer(inner(...innerParams));