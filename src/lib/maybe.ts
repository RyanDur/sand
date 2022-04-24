import {Maybe} from './types';
import {inspect, shallowFreeze, typeOf} from './util';
import {result} from './result';

/**
 * ```ts
 * maybe.some('something').map(value => value + ' more').orNull() // produces: "something more"
 * ```
 * */
const some = <THING>(thing: THING): Maybe<THING> => shallowFreeze({
    isNothing: false,
    orElse: () => thing,
    orNull: () => thing,
    map: f => some(f(thing)),
    mBind: f => f(thing),
    or: () => some(thing),
    toResult: () => result.ok(thing),
    inspect: () => `Some(${inspect(thing)})`
});

/**
 * ```ts
 * maybe.nothing().map(value => value + ' more').orNull() // produces: null
 * ```
 * */
const nothing = <THING>(): Maybe<THING> => shallowFreeze({
    isNothing: true,
    orElse: fallback => fallback,
    orNull: () => null,
    map: () => nothing(),
    mBind: () => nothing(),
    or: f => f(),
    toResult: () => result.err(null),
    inspect: () => 'Nothing'
});

const isNothingValue = <THING>(thing: THING): boolean => {
    const type = typeOf(thing);
    return type === 'undefined' || type === 'null' || type === 'nan';
};

/**
 * ```ts
 * maybe.of('something').map(value => value + ' more').orNull() // produces: "something more"
 * maybe.of(null).map(value => value + ' more').orNull() // produces: null
 * maybe.of(undefined).map(value => value + ' more').orNull() // produces: null
 * maybe.of(NaN).map(value => value + ' more').orNull() // produces: null
 * ```
 * @defaultValue for isNothing
 * ```ts
 * const isNothingValue = <THING>(thing: THING): boolean => {
 *    const type = typeOf(thing);
 *    return type === 'undefined' || type === 'null' || type === 'nan';
 * };
 * ```
 * */
const of = <THING>(
    value?: THING | null,
    isNothing = isNothingValue
): Maybe<THING> => isNothing(value) ? nothing() : some(value as THING);

/**
 * A Maybe is either something or nothing.
 *
 * A factory for creating Maybe's
 *
 * @see implementation  {@link https://github.com/RyanDur/sand/blob/main/src/lib/maybe.ts}
 * @see test {@link https://github.com/RyanDur/sand/blob/main/src/lib/util/index.ts}
 * */
export const maybe = {
    of,
    nothing,
    some
};