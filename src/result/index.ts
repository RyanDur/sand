import {Err, Explanation, Ok, Result, ResultCreator} from "./types";

const freeze = <T>(obj: T) => Object.freeze(obj);
export const explanation = <E>(reason: E, errors: Error[]): Explanation<E> => freeze({reason, errors});

export const ok = <T>(data: T): Ok<T> => freeze({isOk: true, data});
export const err = <E>(explanation: E): Err<E> => freeze({isOk: false, explanation});
export const result: ResultCreator = (aResult) => freeze({
    map: mapper => result(aResult.isOk ? mapper(aResult) : aResult),
    mapError: mapper => result(aResult.isOk ? aResult : mapper(aResult)),
    orNull: () => aResult || null
});

export const okResult = <T, E>(data: T): Result<T, E> => result(ok(data));
export const errResult = <T, E>(reason: E, error: Error = new Error('NO RECORD')): Result<T, E> =>
    result(err(explanation(reason, [error])));
