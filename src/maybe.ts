import {Maybe} from './types';
import {inspect, shallowFreeze, typeOf} from './util';

const some = <T>(value: T): Maybe.Some<T> => shallowFreeze({
    map: f => some(f(value)),
    flatMap: f => f(value),
    value: () => value,
    orElse: () => value,
    orNull: () => value,
    inspect: () => `Some(${inspect(value)})`,
    isNone: false
});

const none = <T>(): Maybe.None<T> => shallowFreeze({
    map: () => none(),
    flatMap: () => none(),
    value: () => undefined as unknown as T,
    orElse: fallback => fallback,
    orNull: () => null,
    inspect: () => 'None',
    isNone: true
});

const isNoneType = (value: unknown): boolean => {
    const type = typeOf(value);
    return type === 'undefined' || type === 'null' || type === 'NaN';
};

export const maybe = <T>(value?: T): Maybe<T> => isNoneType(value) ? none() : some(value as T);