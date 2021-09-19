import {Maybe} from './types';
import {inspect, shallowFreeze, typeOf} from './util';

const some = <T>(thing: T): Maybe<T> => shallowFreeze({
    isNothing: false,
    orElse: () => thing,
    orNull: () => thing,
    map: f => some(f(thing)),
    flatMap: f => f(thing),
    inspect: () => `Some(${inspect(thing)})`
});

const nothing = <T>(): Maybe<T> => shallowFreeze({
    isNothing: true,
    orElse: fallback => fallback,
    orNull: () => null,
    map: () => nothing(),
    flatMap: () => nothing(),
    inspect: () => 'Nothing'
});

const isNothingValue = <T>(thing: T): boolean => {
    const type = typeOf(thing);
    return type === 'undefined' || type === 'null' || type === 'nan';
};

const of = <THING>(thing?: THING | null, isNothing = isNothingValue): Maybe<THING> =>
    isNothing(thing) ? nothing() : some(thing as THING);

export const maybe = {of, nothing, some};