import {shallowFreeze} from './util';
import {Result} from './types';

const okValue = <T>(data: T): Result.Ok<T> => shallowFreeze({isOk: true, data});
const errValue = <E>(explanation: E): Result.Err<E> => shallowFreeze({isOk: false, explanation});

const pipeline = <T, E>(aValue: Result.Value<T, E>): Result.Pipeline<T, E> => shallowFreeze({
    value: () => aValue,
    orElse: fallback => aValue.isOk ? aValue.data : fallback,
    orNull: () => aValue.isOk ? aValue.data : null,
    onOk: consumer => {
        if (aValue.isOk) consumer(aValue.data);
        return pipeline(aValue);
    },
    onErr: consumer => {
        if (!aValue.isOk) consumer(aValue.explanation);
        return pipeline(aValue);
    },
    map: mapper => pipeline(aValue.isOk ? okValue(mapper(aValue.data)) : aValue),
    flatMap: mapper => pipeline(aValue.isOk ? mapper(aValue.data) : aValue),
    mapError: mapper => pipeline(aValue.isOk ? aValue : errValue(mapper(aValue.explanation))),
    flatMapError: mapper => pipeline(aValue.isOk ? aValue : mapper(aValue.explanation))
});

const ok = <T, E>(data: T): Result.Pipeline<T, E> => pipeline(okValue(data));
const err = <T, E>(reason: E): Result.Pipeline<T, E> => pipeline(errValue(reason));

export const result = shallowFreeze({
    ok,
    okValue,
    err,
    errValue,
    pipeline
});