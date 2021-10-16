import {inspect, shallowFreeze} from './util';
import {Result} from './types';

const ok = <T, E>(data: T): Result<T, E> => shallowFreeze({
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

const err = <T, E>(reason: E): Result<T, E> => shallowFreeze({
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

export const result = {ok, err};