import {Err, Explanation, Ok} from './types';

const freeze = <T>(obj: T) => Object.freeze(obj);

export const ok = <T>(data: T): Ok<T> => freeze({
    isOk: true,
    data: () => data,
    map: fn => fn(data),
    flatmap: fn => fn(ok(data))
});

export const err = <E>(explanation: E): Err<E> => freeze({
    isOk: false,
    explanation: () => explanation,
    map: fn => fn(explanation),
    flatmap: fn => fn(err(explanation))
});

export const explanation = <E>(reason: E, errors: Error[] = []): Explanation<E> => freeze({
    reason,
    errors: errors,
    map: fn => fn(reason, errors)
});
