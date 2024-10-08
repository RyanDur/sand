import {Maybe, Nothing, Predicate, Some} from './types';
import {inspect, not, shallowFreeze, typeOf} from './util';
import {failure, success} from './result';

/**
 * ```ts
 * some('some').map(value => value + ' more').orNull() // produces: "some more"
 * ```
 * */
const some = <THING>(thing: THING): Some<THING> => shallowFreeze({
  isNothing: false,
  orElse: () => thing,
  orNull: () => thing,
  map: f => some(f(thing)),
  mBind: f => f(thing),
  or: () => some(thing),
  and: otherMaybe => otherMaybe.map(value => [thing, value]),
  toResult: () => success(thing),
  inspect: () => `Some(${inspect(thing)})`
});

/**
 * ```ts
 * nothing().map(value => value + ' more').orNull() // produces: null
 * ```
 * */
const nothing = (): Nothing => shallowFreeze({
  isNothing: true,
  orElse: fallback => fallback,
  orNull: () => null,
  map: () => nothing(),
  mBind: () => nothing(),
  or: f => f(),
  and: () => nothing(),
  toResult: (fallback) => failure(fallback),
  inspect: () => 'Nothing'
});

const isSomethingValue = <T>(thing: T): boolean => {
  const type = typeOf(thing);
  return not(type === 'undefined' || type === 'null' || type === 'nan');
};

/**
 * ```ts
 * maybe('something').map(value => value + ' more').orNull() // produces: "something more"
 * maybe(null).map(value => value + ' more').orNull() // produces: null
 * maybe(undefined).map(value => value + ' more').orNull() // produces: null
 * maybe(NaN).map(value => value + ' more').orNull() // produces: null
 * ```
 * @defaultValue for isSomething === not('undefined' || type === 'null' || type === 'nan')
 * */
const maybe = <THING>(
  value?: THING | null,
  is: Predicate<THING> = isSomethingValue
): Maybe<THING> => is(value as THING) ? some(value as THING) : nothing();

/**
 * A Maybe is either something or nothing.
 *
 * A factory for creating Maybe's
 *
 * @see implementation  {@link https://github.com/RyanDur/sand/blob/main/src/lib/maybe.ts}
 * @see test {@link https://github.com/RyanDur/sand/blob/main/src/lib/util/index.ts}
 * */
export {
  maybe,
  nothing,
  some
};
