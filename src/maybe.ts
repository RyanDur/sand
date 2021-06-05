import {Maybe} from './types';
import {inspect, shallowFreeze, typeOf} from './util';

const some = <T>(value: T): Maybe.Some<T> => shallowFreeze({
    isNone: false,
    value: () => value,
    orElse: () => value,
    orNull: () => value,
    map: f => some(f(value)),
    flatMap: f => f(value),
    inspect: () => `Some(${inspect(value)})`
});

const none = <T>(): Maybe.None<T> => shallowFreeze({
    isNone: true,
    value: () => null,
    orElse: fallback => fallback,
    orNull: () => null,
    map: () => none(),
    flatMap: () => none(),
    inspect: () => 'None'
});

const isNoneType = (value: unknown): boolean => {
    const type = typeOf(value);
    return type === 'undefined' || type === 'null' || type === 'NaN';
};

export const maybe = <T>(value?: T): Maybe<T> => isNoneType(value) ? none() : some(value as T);