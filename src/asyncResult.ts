import {result} from './result';
import {Result} from './types';
import {inspect} from './util';

const ofPromise = <S, F>(promise: Promise<Result<S, F>>): Result.Async<S, F> => ({
    value: () => promise,
    orElse: fallback => promise.then(({orElse}) => orElse(fallback)),
    map: mapping => ofPromise(promise.then(({map}) => map(mapping))),
    mapFailure: mapping => ofPromise(promise.then(({mapErr}) => mapErr(mapping))),
    flatMap: mapping => ofPromise(new Promise(resolve => promise.then(pipe => pipe
        .onOk(value => mapping(value).onComplete(resolve))
        .onErr(explanation => resolve(result.err(explanation)))))),
    flatMapFailure: mapping => ofPromise(new Promise(resolve => promise.then(pipe => pipe
        .onErr(explanation => mapping(explanation).onComplete(resolve))
        .onOk(value => resolve(result.ok(value)))))),
    onLoading: isLoading => {
        isLoading(true);
        return ofPromise(promise.then(value => {
            isLoading(false);
            return value;
        }));
    },
    onSuccess: consumer => ofPromise(promise.then(({onOk}) => onOk(consumer))),
    onFailure: consumer => ofPromise(promise.then(({onErr}) => onErr(consumer))),
    onComplete: consumer => ofPromise(promise.then(value => {
        consumer(value);
        return value;
    })),
    inspect: () => `AsyncResult(${promise.then(inspect)})`
});

const success = <S, F>(value: S): Result.Async<S, F> => ofPromise(Promise.resolve(result.ok(value)));
const failure = <S, F>(error: F): Result.Async<S, F> => ofPromise(Promise.resolve(result.err(error)));

const of = <S, F>(promise: Promise<S>): Result.Async<S, F> => ofPromise(promise
    .then(value => result.ok(value))
    .catch(reason => result.err(reason)));

export const asyncResult = {of, success, failure};