import {Err, Explanation, Ok} from './types';

const freeze = <T>(obj: T) => Object.freeze(obj);

export const ok = <T>(response: T): Ok<T> => freeze({
    isOk: true,
    map: (fn) => fn(response),
    flatmap: (fn) => fn(ok(response))
});

export const err = <E>(explanation: Explanation<E>): Err<Explanation<E>> => freeze({
    isOk: false,
    map: (fn) => fn(explanation),
    flatmap: (fn) => fn(err(explanation))
});

export const explanation = <E>(reason: E, err?: Error): Explanation<E> => {
    const errors = err ? [err] : [];
    return freeze({reason, errors});
};
