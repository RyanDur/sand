import {result} from './result';
import {Result} from './types';

const successValue = <S>(value: S): Result.Ok<S> => result.okValue(value);
const failureValue = <F>(explanation: F): Result.Err<F> => result.errValue(explanation);

const pipeline = <S, F>(promise: Promise<Result.Value<S, F>>): Result.Async.Pipeline<S, F> => ({
    value: () => promise,
    map: mapping => pipeline(promise
        .then(result.pipeline)
        .then(({map}) => map(mapping))
        .then(({value}) => value())),
    flatMap: (mapping) => pipeline(new Promise(resolve => promise
        .then(result.pipeline)
        .then(pipe => pipe
            .onOk(value => mapping(value).onComplete(resolve))
            .onErr(explanation => resolve(failureValue(explanation)))))),
    mapFailure: mapping => pipeline(promise
        .then(result.pipeline)
        .then(({mapError}) => mapError(mapping))
        .then(({value}) => value())),
    flatMapFailure: mapping => pipeline(new Promise(resolve => promise
        .then(result.pipeline)
        .then(pipe => pipe
            .onErr(explanation => mapping(explanation).onComplete(resolve))
            .onOk(value => resolve(successValue(value)))))),
    onSuccess: consumer => pipeline(promise
        .then(result.pipeline)
        .then(({onOk}) => onOk(consumer))
        .then(({value}) => value())),
    onFailure: consumer => pipeline(promise
        .then(result.pipeline)
        .then(({onErr}) => onErr(consumer))
        .then(({value}) => value())),
    onComplete: consumer => pipeline(promise.then(res => {
        consumer(res);
        return res;
    }))
});

const ofResult = <S, F>(result: Result.Value<S, F>): Result.Async.Pipeline<S, F> =>
    pipeline(new Promise<Result.Value<S, F>>(resolve => resolve(result)));

const ofPromise = <S>(promise: Promise<S>): Result.Async.Pipeline<S, Result.Async.RejectionError> => pipeline(promise
    .then(value => successValue(value))
    .catch(reason => failureValue(reason)));

const success = <S, F>(value: S): Result.Async.Pipeline<S, F> => ofResult(successValue(value));
const failure = <S, F>(error: F): Result.Async.Pipeline<S, F> => ofResult(failureValue(error));

export const asyncResult = {
    pipeline,
    ofPromise,
    success,
    successValue,
    failure,
    failureValue
};