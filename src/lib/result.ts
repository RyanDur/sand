import {inspect, shallowFreeze} from './util';
import {Result} from './types';
import {maybe} from './maybe';

/**
 * ```ts
 * var okResult = result.ok('some value').map(value => value + ', another value');
 * okResult.orNull(); // produces: "some value, another value"
 * okResult.errOrElse('definately this'); // produces: "definately this"
 * ```
 */

const ok = <DATA, REASON>(value: DATA): Result.Ok<DATA, REASON> => shallowFreeze({
    isOk: true,
    value,
    orNull: () => value,
    orElse: (_) => value,
    map: f => ok(f(value)),
    mBind: f => f(value),
    or: () => ok(value),
    either: (f, _) => f(value),
    onOk: consumer => {
        consumer(value);
        return ok(value);
    },
    onErr: () => ok(value),
    toMaybe: () => maybe.some(value),
    inspect: () => `Ok(${inspect(value)})`
});


/**
 * ```ts
 * const errResult = result.err('some err').mapErr(value => value + ', another err');
 * errResult.orNull(); // produces: null
 * errResult.errOrElse('Not this'); // produces: "some err, another err"
 * ```
 */


const err = <VALUE, REASON>(value: REASON): Result.Err<VALUE, REASON> => shallowFreeze({
    isOk: false,
    value,
    orNull: () => null,
    orElse: fallback => fallback,
    map: () => err(value),
    mBind: () => err(value),
    or: f => f(value),
    either: (_, f) => f(value),
    onOk: () => err(value),
    onErr: consumer => {
        consumer(value);
        return err(value);
    },
    toMaybe: () => maybe.nothing(),
    inspect: () => `Err(${inspect(value)})`
});

/**
 * The Result is either ok or not. Depending on what type of result it is affects how the results functions behave.
 * For example, the 'orNull' function for an ok result will return the value of the result while err will return null.
 *
 * A factory for creating Result's
 *
 * @see implementation {@link https://github.com/RyanDur/sand/blob/main/sr/lib/result.ts}
 * @see test for ok {@link https://github.com/RyanDur/sand/blob/main/src/lib/__tests__/result.spec.ts#L9}
 * @see test for err {@link https://github.com/RyanDur/sand/blob/main/src/lib/__tests__/result.spec.ts#L29}
 * */
export const result = {ok, err};