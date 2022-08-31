import {inspect, shallowFreeze} from './util';
import {nothing, some} from './maybe';
import {Failure, Success} from './types';

/**
 * ```ts
 * var successResult = success('some value').map(value => value + ', another value');
 * successResult.orNull(); // produces: "some value, another value"
 * okResult.orElse('definitely this'); // produces: "definitely this"
 * ```
 */

const success = <VALUE>(value: VALUE): Success<VALUE> => shallowFreeze({
    isSuccess: true,
    value,
    orNull: () => value,
    orElse: () => value,
    map: f => success(f(value)),
    mBind: f => f(value),
    or: () => success(value),
    either: (f, _) => f(value),
    onSuccess: consumer => {
        consumer(value);
        return success(value);
    },
    onFailure: () => success(value),
    toMaybe: () => some(value),
    inspect: () => `Success(${inspect(value)})`
});


/**
 * ```ts
 * const failureResult = failure('some failure').mapFailure(value => value + ', another failure');
 * failureResult.orNull(); // produces: null
 * failureResult.orElse('Not this'); // produces: "some failure, another failure"
 * ```
 */


const failure = <ERROR>(value: ERROR): Failure<ERROR> => shallowFreeze({
    isSuccess: false,
    value,
    orNull: () => null,
    orElse: fallback => fallback,
    map: () => failure(value),
    mBind: () => failure(value),
    or: f => f(value),
    either: (_, f) => f(value),
    onSuccess: () => failure(value),
    onFailure: consumer => {
        consumer(value);
        return failure(value);
    },
    toMaybe: () => nothing(),
    inspect: () => `Failure(${inspect(value)})`
});

/**
 * The Result is either success or not. Depending on what type of result it is affects how the results functions behave.
 * For example, the 'orNull' function for a success result will return the value of the result while failure will return null.
 *
 * A factory for creating Result's
 *
 * @see implementation {@link https://github.com/RyanDur/sand/blob/main/sr/lib/result.ts}
 * @see test for success {@link https://github.com/RyanDur/sand/blob/main/src/lib/__tests__/result.spec.ts#L9}
 * @see test for failure {@link https://github.com/RyanDur/sand/blob/main/src/lib/__tests__/result.spec.ts#L29}
 * */
export {success, failure};
