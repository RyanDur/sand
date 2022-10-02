import {Maybe, Nothing, Some} from './types';
import {inspect, not, shallowFreeze, typeOf} from './util';
import {failure, success} from './result';

/**
 * ```ts
 * maybe.some('some').map(value => value + ' more').orNull() // produces: "some more"
 * ```
 * */
const some = <THING>(thing: THING): Some<THING> => shallowFreeze({
  isNothing: false,
  orElse: () => thing,
  orNull: () => thing,
  map: f => some(f(thing)),
  mBind: f => f(thing),
  or: () => some(thing),
  toResult: () => success(thing),
  inspect: () => `Some(${inspect(thing)})`
});

/**
 * ```ts
 * maybe.nothing().map(value => value + ' more').orNull() // produces: null
 * ```
 * */
const nothing = (): Nothing => shallowFreeze({
  isNothing: true,
  orElse: fallback => fallback,
  orNull: () => null,
  map: () => nothing(),
  mBind: () => nothing(),
  or: f => f(),
  toResult: () => failure(undefined),
  inspect: () => 'Nothing'
});

const isSomethingValue = <T>(thing: T): boolean => {
  const type = typeOf(thing);
  return not(type === 'undefined' || type === 'null' || type === 'nan');
};

/**
 * ```ts
 * maybe.of('something').map(value => value + ' more').orNull() // produces: "something more"
 * maybe.of(null).map(value => value + ' more').orNull() // produces: null
 * maybe.of(undefined).map(value => value + ' more').orNull() // produces: null
 * maybe.of(NaN).map(value => value + ' more').orNull() // produces: null
 * ```
 * @defaultValue for isSomething === not('undefined' || type === 'null' || type === 'nan')
 * */
const maybe = <THING>(
  value?: THING | null,
  is = isSomethingValue(value)
): Maybe<THING> => is ? some(value as THING) : nothing();

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
