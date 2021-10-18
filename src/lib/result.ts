import {inspect, shallowFreeze} from './util';
import {Result} from './types';

/**
 * ```ts
 * var okResult = result.ok('some value').map(value => value + ', another value');
 * okResult.orNull(); // produces: "some value, another value"
 * okResult.errOrElse('definately this'); // produces: "definately this"
 * ```
 */
const ok = <DATA, REASON>(data: DATA): Result<DATA, REASON> => shallowFreeze({
    isOk: true,
    data,
    orNull: () => data,
    orElse: () => data,
    errOrElse: fallback => fallback,
    map: f => ok(f(data)),
    mapErr: () => ok(data),
    flatMap: f => f(data),
    flatMapErr: () => ok(data),
    onOk: consumer => {
        consumer(data);
        return ok(data);
    },
    onErr: () => ok(data),
    inspect: () => `Ok(${inspect(data)})`
});

/**
 * ```ts
 * const errResult = result.err('some err').mapErr(value => value + ', another err');
 * errResult.orNull(); // produces: null
 * errResult.errOrElse('Not this'); // produces: "some err, another err"
 * ```
 */

const err = <DATA, REASON>(reason: REASON): Result<DATA, REASON> => shallowFreeze({
    isOk: false,
    reason,
    orNull: () => null,
    orElse: fallback => fallback,
    errOrElse: () => reason,
    map: () => err(reason),
    mapErr: f => err(f(reason)),
    flatMap: () => err(reason),
    flatMapErr: f => f(reason),
    onOk: () => err(reason),
    onErr: consumer => {
        consumer(reason);
        return err(reason);
    },
    inspect: () => `Err(${inspect(reason)})`
});

/**
 * @see implementation {@link https://github.com/RyanDur/sand/blob/main/src/result.ts}
 * @see test for ok {@link https://github.com/RyanDur/sand/blob/main/src/__tests__/result.spec.ts#L9}
 * @see test for err {@link https://github.com/RyanDur/sand/blob/main/src/__tests__/result.spec.ts#L29}
 * */
export const result = {ok, err};