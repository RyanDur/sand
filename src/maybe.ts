import {Maybe} from './types';
import {inspect, shallowFreeze, typeOf} from './util';

const some = <T>(value: T): Maybe<T> => shallowFreeze({
    isNone: false,
    orElse: () => value,
    orNull: () => value,
    map: f => some(f(value)),
    flatMap: f => f(value),
    inspect: () => `Some(${inspect(value)})`
});

const none = <T>(): Maybe<T> => shallowFreeze({
    isNone: true,
    orElse: fallback => fallback,
    orNull: () => null,
    map: () => none(),
    flatMap: () => none(),
    inspect: () => 'None'
});

const isNoneType = <T>(value: T): boolean => {
    const type = typeOf(value);
    return type === 'undefined' || type === 'null' || type === 'nan';
};

const of = <T>(value?: T | null, isNone = isNoneType): Maybe<T> => isNone(value) ? none() : some(value as T);

export const maybe = {of, none, some};