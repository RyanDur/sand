import {failure as err, success as ok} from './result';
import {Result} from './types';
import {inspect} from './util';

const ofPromise = <SUCCESS, FAILURE>(promise: Promise<Result<SUCCESS, FAILURE>>): Result.Async<SUCCESS, FAILURE> => ({
    value: promise.then(result => result.value),
    orNull: () => promise.then(({orNull}) => orNull()),
    orElse: fallback => promise.then(({orElse}) => orElse(fallback)),
    map: fn => ofPromise(promise.then(({map}) => map(fn))),
    mBind: fn => ofPromise(new Promise(resolve => promise.then(pipe => pipe
        .onSuccess(value => fn(value).onComplete(resolve))
        .onFailure(value => err(value).onComplete(resolve))))),
    or: fn => ofPromise(new Promise(resolve => promise.then(pipe => pipe
        .onSuccess(value => ok(value).onComplete(resolve))
        .onFailure(value => fn(value).onComplete(resolve))
    ))),
    either: (onSuccess, onFailure) => ofPromise(new Promise(resolve => promise.then(pipe => pipe
        .onSuccess(value => onSuccess(value).onComplete(resolve))
        .onFailure(value => onFailure(value).onComplete(resolve))))),
    onPending: is => {
        is(true);
        return ofPromise(promise.then(value => {
            is(false);
            return value;
        }));
    },
    onSuccess: consumer => ofPromise(promise.then(({onSuccess}) => onSuccess(consumer))),
    onFailure: consumer => ofPromise(promise.then(({onFailure}) => onFailure(consumer))),
    onComplete: consumer => ofPromise(promise.then(({onComplete}) => onComplete(consumer))),
    inspect: () => promise.then(value => `Result.Async(${inspect(value)})`)
});

/**
 * {@link https://github.com/RyanDur/sand/blob/f36b1bbc5e93b319400dd4a8f53decc5dc7d60ea/src/lib/asyncResult.ts#L6 | orNull Implementation}
 *
 * {@link https://github.com/RyanDur/sand/blob/f36b1bbc5e93b319400dd4a8f53decc5dc7d60ea/src/lib/asyncResult.ts#L8 | failureOrElse Implementation}
 * ```ts
 * const successfulResult = await asyncResult.success('some value').map(value => value + ', another value');
 * successfulResult.orNull(); // produces: "some value, another value"
 * successfulResult.failureOrElse('definitely this'); // produces: "definitely this"
 * ```
 * */
const success = <SUCCESS, FAILURE>(data: SUCCESS): Result.Async<SUCCESS, FAILURE> => ofPromise(Promise.resolve(ok(data) as unknown as Result<SUCCESS, FAILURE>));

/**
 * ```ts
 * const failureResult = await asyncResult.failure('some failure').mapErr(value => value + ', another failure');
 * failureResult.orNull(); // produces: null
 * failureResult.failureOrElse('Not this'); // produces: "some failure, another failure"
 * ```
 * */
const failure = <SUCCESS, FAILURE>(reason: FAILURE): Result.Async<SUCCESS, FAILURE> => ofPromise(Promise.resolve(err(reason) as unknown as Result<SUCCESS, FAILURE>));

/**
 * ```ts
 * const successfulResult = await asyncResult.of(Promise.resolve('some value')).map(value => value + ', another value');
 * successfulResult.orNull(); // produces: "some value, another value"
 * successfulResult.failureOrElse('definitely this'); // produces: "definitely this"
 * ```
 * ```ts
 * const failureResult = await asyncResult.of(Promise.reject('some failure')).mapErr(value => value + ', another failure');
 * failureResult.orNull(); // produces: null
 * failureResult.failureOrElse('Not this'); // produces: "some failure, another failure"
 * ```
 * */
const of = <SUCCESS, FAILURE>(promise: Promise<SUCCESS>): Result.Async<SUCCESS, FAILURE> => ofPromise(promise
    .then(value => ok(value) as unknown as Result<SUCCESS, FAILURE>)
    .catch(reason => err(reason) as unknown as Result<SUCCESS, FAILURE>));

/**
 * The AsyncResult is something that [Damien LeBfailureigaud](https://github.com/dam5s) has introduced me to. I had the chance
 * to work with him on a project that inspired me to write this lib. Together we
 * collaborated on [React Redux Starter](https://github.com/dam5s/react-redux-starter) to aid us in developing future projects with
 * clients.
 *
 * The type allows you to work with a promise in the same way you would work with a Result, with some extra helpers.
 *
 * A factory for creating AsyncResult's
 *
 * @see Implementation:  {@link https://github.com/RyanDur/sand/blob/main/src/lib/asyncResult.ts}
 * @see Test: {@link https://github.com/RyanDur/sand/blob/main/src/lib/__tests__/asyncResult.spec.ts}
 * */
export const asyncResult = {of, success, failure};
