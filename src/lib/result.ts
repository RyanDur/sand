import {inspect, shallowFreeze} from './util';
import {nothing, some} from './maybe';
import {Failure, Success} from './types';

/**
 * ```ts
 * const successResult = success('some value').map(value => value + ', another value');
 * successResult.orNull(); // produces: "some value, another value"
 * successResult.orElse('fallback'); // produces: "some value, another value" (orElse returns the value for a success)
 * ```
 */
const success = <VALUE, ERROR = never>(value: VALUE): Success<VALUE, ERROR> => {
    const self: Success<VALUE, never> = shallowFreeze({
        isSuccess: true,
        value,
        orNull: () => value,
        orElse: () => value,
        map: (f) => success(f(value)),
        mBind: (f) => f(value),
        or: () => self,
        either: (onSuccess) => onSuccess(value),
        onSuccess: (consumer) => {
            consumer(value);
            return self;
        },
        onFailure: () => self,
        onComplete: (consumer) => {
            consumer(self);
            return self;
        },
        toMaybe: () => some(value),
        inspect: () => `Success(${inspect(value)})`
    });
    return self;
};


/**
 * ```ts
 * const failureResult = failure('some failure').or(reason => failure(reason + ', another failure'));
 * failureResult.orNull(); // produces: null
 * failureResult.orElse('Not this'); // produces: "Not this" (orElse returns the fallback for a failure)
 * failureResult.either(value => value, reason => reason); // produces: "some failure, another failure"
 * ```
 */
const failure = <ERROR, VALUE = never>(reason: ERROR): Failure<VALUE, ERROR> => {
    const self: Failure<never, ERROR> = shallowFreeze({
        isSuccess: false,
        reason,
        orNull: () => null,
        orElse: (fallback) => fallback,
        map: () => self,
        mBind: () => self,
        or: (f) => f(reason),
        either: (_onSuccess, onFailure) => onFailure(reason),
        onSuccess: () => self,
        onFailure: (consumer) => {
            consumer(reason);
            return self;
        },
        onComplete: (consumer) => {
            consumer(self);
            return self;
        },
        toMaybe: () => nothing(),
        inspect: () => `Failure(${inspect(reason)})`
    });
    return self;
};

/**
 * The Result is either success or not. Depending on what type of result it is affects how the results functions behave.
 * For example, the 'orNull' function for a success result will return the value of the result while failure will return null.
 *
 * A factory for creating Result's
 *
 * @see implementation {@link https://github.com/RyanDur/sand/blob/main/src/lib/result.ts}
 * @see test for success {@link https://github.com/RyanDur/sand/blob/main/src/lib/__tests__/result.spec.ts#L9}
 * @see test for failure {@link https://github.com/RyanDur/sand/blob/main/src/lib/__tests__/result.spec.ts#L29}
 * */
export {success, failure};
