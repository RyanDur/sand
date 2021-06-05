import {inspect, shallowFreeze} from './util';
import {Result} from './types';
import {Func, Predicate} from './function/types';

export const ok = <T, E>(data: T): Result.Ok<T, E> => shallowFreeze({
    isOk: true,
    map: f => ok(f(data)),
    mapErr: () => ok(data),
    value: () => data,
    flatMap: f => f(data),
    flatMapErr: () => ok(data),
    orElse: () => data,
    orElseErr: fallback => fallback,
    orNull: () => data,
    onOk: consumer => {
        consumer(data);
        return ok(data);
    },
    onErr: () => ok(data),
    inspect: () => `Ok(${inspect(data)})`
});

export const err = <T, E>(explanation: E): Result.Err<T, E> => ({
    isOk: false,
    map: () => err(explanation),
    mapErr: f => err(f(explanation)),
    flatMap: () => err(explanation),
    flatMapErr: f => f(explanation),
    orElse: other => other,
    orElseErr: () => explanation,
    orNull: () => null,
    onOk: () => err(explanation),
    onErr: consumer => {
        consumer(explanation);
        return err(explanation);
    },
    inspect: () => `Err(${inspect(explanation)})`
});

export const result = <T, E>(isOk: Predicate<T>, explanation: Func<T, E>) => (value: T): Result<T, E> =>
    isOk(value) ? ok(value) : err(explanation(value));