import {Result} from './Result';
import {foldAll, foldSome} from '../kernel';

export type Maybe<THING> = Some<THING> | Nothing

export type Some<THING> = {
    readonly isNothing: false;
    orNull(): THING;
    orElse<FALLBACK>(fallback: FALLBACK): THING;
    map<NEW_THING>(f: (value: THING) => NEW_THING): Some<NEW_THING>;
    mBind<NEW_THING>(f: (value: THING) => Maybe<NEW_THING>): Maybe<NEW_THING>;
    or(f: () => Maybe<THING>): Maybe<THING>;
    and<NEW_THING>(other: Maybe<NEW_THING>): Maybe<[THING, NEW_THING]>;
    either<ON_SOME, ON_NOTHING>(onSome: (thing: THING) => ON_SOME, onNothing: () => ON_NOTHING): ON_SOME | ON_NOTHING;
    toResult<ERROR>(fallback: ERROR): Result<THING, ERROR>;
    inspect(): string;
}

export type Nothing = {
    readonly isNothing: true;
    orElse<FALLBACK>(fallback: FALLBACK): FALLBACK;
    orNull(): null;
    map<NEW_THING>(f: (value: never) => NEW_THING): Nothing;
    mBind<NEW_THING>(f: (value: never) => Maybe<NEW_THING>): Maybe<NEW_THING>;
    or<THING>(f: () => Maybe<THING>): Maybe<THING>;
    and<OTHER>(other: Maybe<OTHER>): Nothing;
    either<ON_SOME, ON_NOTHING>(onSome: (thing: never) => ON_SOME, onNothing: () => ON_NOTHING): ON_SOME | ON_NOTHING;
    toResult<ERROR>(fallback: ERROR): Result<never, ERROR>;
    inspect(): string;
}

/**
 * Array.reduce lifted over the container: reduce.all demands every
 * item be present; reduce.some skips the nothings.
 *
 * ```ts
 * Maybe.reduce.some([some(1), nothing(), some(3)], (a, b) => some(a + b), some(0)).orNull(); // produces: 4
 * ```
 * */
export namespace Maybe {
  export const reduce = {
    all: <VALUE, ACC>(
      maybes: readonly Maybe<VALUE>[],
      reducer: (accumulator: ACC, value: VALUE) => Maybe<ACC>,
      seed: Maybe<ACC>
    ): Maybe<ACC> =>
      foldAll<VALUE, ACC, Maybe<ACC>>(maybes, reducer, seed),
    some: <VALUE, ACC>(
      maybes: readonly Maybe<VALUE>[],
      reducer: (accumulator: ACC, value: VALUE) => Maybe<ACC>,
      seed: Maybe<ACC>
    ): Maybe<ACC> =>
      foldSome<VALUE, ACC, Maybe<ACC>>(maybes, reducer, seed)
  };
}
