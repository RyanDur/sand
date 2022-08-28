import {inspect, shallowFreeze} from './util';
import {nothing, some} from './maybe';
import {Err, Ok} from './types';

/**
 * ```ts
 * var okResult = success('some value').map(value => value + ', another value');
 * okResult.orNull(); // produces: "some value, another value"
 * okResult.orElse('definitely this'); // produces: "definitely this"
 * ```
 */

const ok = <VALUE>(value: VALUE): Ok<VALUE> => shallowFreeze({
    isOk: true,
    value,
    orNull: () => value,
    orElse: () => value,
    map: f => ok(f(value)),
    mBind: f => f(value),
    or: () => ok(value),
    either: (f, _) => f(value),
    onSuccess: consumer => {
        consumer(value);
        return ok(value);
    },
    onFailure: () => ok(value),
    toMaybe: () => some(value),
    inspect: () => `Ok(${inspect(value)})`
});


/**
 * ```ts
 * const failureResult = failure('some failure').mapErr(value => value + ', another failure');
 * failureResult.orNull(); // produces: null
 * failureResult.orElse('Not this'); // produces: "some failure, another failure"
 * ```
 */


const err = <ERROR>(value: ERROR): Err<ERROR> => shallowFreeze({
    isOk: false,
    value,
    orNull: () => null,
    orElse: fallback => fallback,
    map: () => err(value),
    mBind: () => err(value),
    or: f => f(value),
    either: (_, f) => f(value),
    onSuccess: () => err(value),
    onFailure: consumer => {
        consumer(value);
        return err(value);
    },
    toMaybe: () => nothing(),
    inspect: () => `Err(${inspect(value)})`
});

/**
 * The Result is either success or not. Depending on what type of result it is affects how the results functions behave.
 * For example, the 'orNull' function for a success result will return the value of the result while failure will return null.
 *
 * A factory for creating Result's
 *
 * @see implementation {@link https://github.com/RyanDur/sand/blob/main/sr/lib/result.ts}
 * @see test for ok {@link https://github.com/RyanDur/sand/blob/main/src/lib/__tests__/result.spec.ts#L9}
 * @see test for failure {@link https://github.com/RyanDur/sand/blob/main/src/lib/__tests__/result.spec.ts#L29}
 * */
export {ok, err};
