import {Result} from './types';

const shallowFreeze = <T>(obj: T) => Object.freeze(obj);
const okValue = <T>(data: T): Result.Ok<T> => shallowFreeze({isOk: true, data});
const errValue = <E>(reason: E): Result.Err<E> => shallowFreeze({isOk: false, reason});

const pipeline: Result.PipelineProvider = (aValue) => shallowFreeze({
    value: () => aValue,
    orElse: (fallback) => aValue.isOk ? aValue.data : fallback,
    orNull: () => aValue.isOk ? aValue.data : null,
    map: mapper => pipeline(aValue.isOk ? okValue(mapper(aValue.data)) : aValue),
    flatMap: mapper => pipeline(aValue.isOk ? mapper(aValue.data) : aValue),
    mapError: mapper => pipeline(aValue.isOk ? aValue : errValue(mapper(aValue.reason))),
    flatMapError: mapper => pipeline(aValue.isOk ? aValue : mapper(aValue.reason))
});

const ok = <T, E>(data: T): Result.Pipeline<T, E> => pipeline(okValue(data));
const err = <T, E>(reason: E): Result.Pipeline<T, E> => pipeline(errValue(reason));

export const result = shallowFreeze({
    ok,
    okValue,
    err,
    errValue
})