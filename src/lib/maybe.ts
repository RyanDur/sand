import {Maybe as MaybeType, Nothing, Predicate, Some} from './types';
import {inspect, not, shallowFreeze, typeOf} from './util';
import {failure, success} from './result';

/**
 * ```ts
 * some('some').map(value => value + ' more').orNull() // produces: "some more"
 * ```
 * */
const some = <THING>(thing: THING): Some<THING> => {
  const self: Some<THING> = shallowFreeze({
    isNothing: false,
    orElse: () => thing,
    orNull: () => thing,
    map: <NEW_THING>(f: (value: THING) => NEW_THING) => some(f(thing)),
    mBind: <NEW_THING>(f: (value: THING) => MaybeType<NEW_THING>) => f(thing),
    or: () => self,
    and: <NEW_THING>(other: MaybeType<NEW_THING>) => other.map(value => [thing, value] as [THING, NEW_THING]),
    toResult: <ERROR>(_fallback: ERROR) => success<THING, ERROR>(thing),
    inspect: () => `Some(${inspect(thing)})`
  });
  return self;
};

/**
 * ```ts
 * nothing().map(value => value + ' more').orNull() // produces: null
 * ```
 * */
let NOTHING: Nothing | undefined;
const nothing = (): Nothing => NOTHING ??= shallowFreeze({
  isNothing: true,
  orElse: <THING>(fallback: THING) => fallback,
  orNull: () => null,
  map: () => nothing(),
  mBind: () => nothing(),
  or: <THING>(f: () => MaybeType<THING>) => f(),
  and: () => nothing(),
  toResult: <ERROR>(fallback: ERROR) => failure<ERROR>(fallback),
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
): MaybeType<THING> => is(value as THING) ? some(value as THING) : nothing();

/**
 * A Maybe is either something or nothing.
 *
 * A factory for creating Maybe's
 *
 * @see implementation  {@link https://github.com/RyanDur/sand/blob/main/src/lib/maybe.ts}
 * @see test {@link https://github.com/RyanDur/sand/blob/main/src/lib/__tests__/maybe.spec.ts}
 * */
export {
  maybe,
  nothing,
  some
};

export type Maybe<THING> = MaybeType<THING>;

const allOf = <VALUE, ACC>(
  maybes: readonly MaybeType<VALUE>[],
  reducer: (accumulator: ACC, value: VALUE) => MaybeType<ACC>,
  seed: ACC
): MaybeType<ACC> =>
  maybes.reduce<MaybeType<ACC>>(
    (accumulator, item) => accumulator.mBind(a => item.mBind(v => reducer(a, v))),
    some(seed)
  );

const someOf = <VALUE, ACC>(
  maybes: readonly MaybeType<VALUE>[],
  reducer: (accumulator: ACC, value: VALUE) => MaybeType<ACC>,
  seed: ACC
): MaybeType<ACC> => {
  let accumulator: MaybeType<ACC> = some(seed);
  for (const item of maybes) {
    if (!item.isNothing) {
      accumulator = accumulator.mBind(a => item.mBind(v => reducer(a, v)));
      if (accumulator.isNothing) return accumulator;
    }
  }
  return accumulator;
};

/**
 * `Maybe.allOf` requires every maybe to be something; `Maybe.someOf` keeps the ones that are.
 * Both fold a batch onto a seed.
 */
export const Maybe = {allOf, someOf};
