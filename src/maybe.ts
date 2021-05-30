import {Maybe} from './types';
import {shallowFreeze, typeOf} from './util';

const some = <T>(value: T): Maybe.Some<T> => shallowFreeze({
    map: f => some(f(value)),
    orElse: () => value,
    inspect: () => `Some(${String(value)})`,
    isNone: false
});

const none = <T>(): Maybe.None<T> => shallowFreeze({
    map: () => none(),
    orElse: fallback => fallback,
    inspect: () => 'None',
    isNone: true
});

const isNoneType = (value: unknown): boolean => {
    const type = typeOf(value);
    return type === 'undefined' || type === 'null' || type === 'NaN';
};

export const maybe = <T>(value?: T): Maybe<T> => isNoneType(value) ? none() : some(value as T);