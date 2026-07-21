import {inspect, shallowFreeze} from './util';
import {nothing, some} from './maybe';
import {Failure, Result as ResultType, Success} from './types';

/**
 * ```ts
 * const successResult = success('some value').map(value => value + ', another value');
 * successResult.orNull(); // produces: "some value, another value"
 * successResult.orElse('fallback'); // produces: "some value, another value" (orElse returns the value for a success)
 * ```
 */
const success = <VALUE, ERROR = never>(value: VALUE): Success<VALUE, ERROR> => {
    const self: Success<VALUE, ERROR> = shallowFreeze({
        isSuccess: true,
        value,
        orNull: () => value,
        orElse: () => value,
        map: <NEW_VALUE>(f: (value: VALUE) => NEW_VALUE) => success<NEW_VALUE, ERROR>(f(value)),
        mBind: <NEW_VALUE>(f: (value: VALUE) => ResultType<NEW_VALUE, ERROR>) => f(value),
        or: <NEW_ERROR>(_f: (reason: ERROR) => ResultType<VALUE, NEW_ERROR>) => success<VALUE, NEW_ERROR>(value),
        either: <T>(onSuccess: (value: VALUE) => T) => onSuccess(value),
        onSuccess: (consumer: (value: VALUE) => void) => {
            consumer(value);
            return self;
        },
        onFailure: () => self,
        onComplete: (consumer: (result: ResultType<VALUE, ERROR>) => void) => {
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
    const self: Failure<VALUE, ERROR> = shallowFreeze({
        isSuccess: false,
        reason,
        orNull: () => null,
        orElse: (fallback: VALUE) => fallback,
        map: <NEW_VALUE>(_f: (value: VALUE) => NEW_VALUE) => failure<ERROR, NEW_VALUE>(reason),
        mBind: <NEW_VALUE>(_f: (value: VALUE) => ResultType<NEW_VALUE, ERROR>) => failure<ERROR, NEW_VALUE>(reason),
        or: <NEW_ERROR>(f: (reason: ERROR) => ResultType<VALUE, NEW_ERROR>) => f(reason),
        either: <T>(_onSuccess: (value: VALUE) => T, onFailure: (reason: ERROR) => T) => onFailure(reason),
        onSuccess: () => self,
        onFailure: (consumer: (reason: ERROR) => void) => {
            consumer(reason);
            return self;
        },
        onComplete: (consumer: (result: ResultType<VALUE, ERROR>) => void) => {
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

export type Result<VALUE, ERROR> = ResultType<VALUE, ERROR>;
export declare namespace Result {
    export type Async<SUCCESS, FAILURE> = ResultType.Async<SUCCESS, FAILURE>;
}

const allOf = <VALUE, ERROR, ACC>(
    results: readonly ResultType<VALUE, ERROR>[],
    reducer: (accumulator: ACC, value: VALUE) => ResultType<ACC, ERROR>,
    seed: ACC
): ResultType<ACC, ERROR> =>
    results.reduce<ResultType<ACC, ERROR>>(
        (accumulator, item) => accumulator.mBind(a => item.mBind(v => reducer(a, v))),
        success<ACC, ERROR>(seed)
    );

const someOf = <VALUE, ERROR, ACC>(
    results: readonly ResultType<VALUE, ERROR>[],
    reducer: (accumulator: ACC, value: VALUE) => ResultType<ACC, ERROR>,
    seed: ACC
): ResultType<ACC, ERROR> => {
    let accumulator: ResultType<ACC, ERROR> = success<ACC, ERROR>(seed);
    for (const item of results) {
        if (item.isSuccess) {
            accumulator = accumulator.mBind(a => item.mBind(v => reducer(a, v)));
            if (!accumulator.isSuccess) return accumulator;
        }
    }
    return accumulator;
};

/**
 * `Result.allOf` requires every result to succeed; `Result.someOf` keeps the ones that do.
 * Both fold a batch onto a seed and short-circuit when the reducer fails.
 */
export const Result = {allOf, someOf};
