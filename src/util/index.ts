export const shallowFreeze = <T>(obj: T): T => Object.freeze(obj);
type VariadicFunc<T = any, NewT = any> = (...t: T[]) => NewT;
export type Func<T = any, NewT = any> = (t: T) => NewT;
type ReducerFunc<T, NewT> = (acc: NewT, value: T) => NewT;

export const typeOf = (value: unknown): string => {
    if (Number.isNaN(value)) return 'NaN';
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
};

const not = (value: unknown): boolean => !value;

export const empty = (value?: unknown): boolean => {
    switch (typeOf(value)) {
        case 'NaN':
        case 'undefined':
        case 'null':
            return true;
        case 'array':
        case 'string':
            return not(String(value).length);
        case 'object':
            return empty(Object.keys(value as Record<string, unknown>));
        default:
            return false;
    }
};

export const reduce = <T, NewT>(callback: ReducerFunc<T, NewT>, start: NewT) => ([head, ...tail]: T[]): NewT =>
    head ? reduce(callback, callback(start, head))(tail) : start;

const reverse = <T>([head, ...tail]: T[]): T[] => empty(tail) ? [head] : [...reverse(tail), head];

export const pipe = <T, NewT>(...[head, ...tail]: VariadicFunc[]): VariadicFunc<T, NewT> => arg =>
    reduce<Func, NewT>((acc, fn) => fn(acc), head(arg))(tail);

export const compose = <T, NewT>(...fns: VariadicFunc[]): VariadicFunc<T, NewT> => pipe(...reverse(fns));

const has = compose(not, empty);

type MapFunc = <T, NewT>(func: Func<T, NewT>) => Func<T[], NewT[]>;
export const map: MapFunc = func => ([head, ...tail]) =>
    has(tail) ? [func(head), ...map(func)(tail) || []] : [func(head)];

export const filter = <T>(f: Func<T, boolean>) => ([head, ...tail]: T[] = []): T[] => {
    if (empty(head)) return [];
    return f(head) ? [head, ...filter(f)(tail)] : filter(f)(tail);
};

type Head = {
    (a: string): string;
    <T>(a: T[]): T;
}

type Tail = {
    (a: string): string;
    <T>(a: T[]): T[];
}

export const head: Head = (value: any): any => value[0];
export const tail: Tail = (value: any): any => value.slice(1);

export type Id<T> = {
    readonly orElse: (fallback: T) => T;
}
export type Functor<T> = Id<T> & {
    readonly map: <NewT>(func: Func<T, NewT>) => Functor<NewT>;
}
