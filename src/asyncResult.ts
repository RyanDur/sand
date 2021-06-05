import {err, ok} from './result';
import {Result} from './types';
import {inspect} from './util';

const success = <S, F>(value: S): Result.Ok<S, F> => ok(value);
const failure = <S, F>(explanation: F): Result.Err<S, F> => err(explanation);

const ofPromise = <S, F>(promise: Promise<Result<S, F>>): Result.Async<S, F> => ({
    value: () => promise,
    orElse: fallback => promise.then(({orElse}) => orElse(fallback)),
    map: mapping => ofPromise(promise.then(({map}) => map(mapping))),
    mapFailure: mapping => ofPromise(promise.then(({mapErr}) => mapErr(mapping))),
    flatMap: mapping => ofPromise(new Promise(resolve => promise
        .then(pipe => pipe
            .onOk(value => mapping(value).onComplete(resolve))
            .onErr(explanation => resolve(failure(explanation)))))),
    flatMapFailure: mapping => ofPromise(new Promise(resolve => promise
        .then(pipe => pipe
            .onErr(explanation => mapping(explanation).onComplete(resolve))
            .onOk(value => resolve(success(value)))))),
    onSuccess: consumer => ofPromise(promise.then(({onOk}) => onOk(consumer))),
    onFailure: consumer => ofPromise(promise.then(({onErr}) => onErr(consumer))),
    inspect: () => `AsyncResult(${promise.then(inspect)})`,
    onComplete: consumer => ofPromise(promise.then(value => {
        consumer(value);
        return value;
    }))
});

export const asyncResult = <S, F>(promise: Promise<S>): Result.Async<S, F> => ofPromise(promise
    .then(value => success(value))
    .catch(reason => failure(reason)));