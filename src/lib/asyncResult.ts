import {result} from './result';
import {Result} from './types';
import {inspect} from './util';

const ofPromise = <SUCCESS, FAILURE>(promise: Promise<Result<SUCCESS, FAILURE>>): Result.Async<SUCCESS, FAILURE> => ({
    orNull: () => promise.then(({orNull}) => orNull()),
    orElse: fallback => promise.then(({orElse}) => orElse(fallback)),
    failureOrElse: fallback => promise.then(({errOrElse}) => errOrElse(fallback)),
    map: mapping => ofPromise(promise.then(({map}) => map(mapping))),
    mapFailure: mapping => ofPromise(promise.then(({mapErr}) => mapErr(mapping))),
    flatMap: mapping => ofPromise(new Promise(resolve => promise.then(pipe => pipe
        .onOk(value => mapping(value).onComplete(resolve))
        .onErr(explanation => resolve(result.err(explanation)))))),
    flatMapFailure: mapping => ofPromise(new Promise(resolve => promise.then(pipe => pipe
        .onOk(value => resolve(result.ok(value)))
        .onErr(explanation => mapping(explanation).onComplete(resolve))))),
    onPending: isPending => {
        isPending(true);
        return ofPromise(promise.then(value => {
            isPending(false);
            return value;
        }));
    },
    onSuccess: consumer => ofPromise(promise.then(({onOk}) => onOk(consumer))),
    onFailure: consumer => ofPromise(promise.then(({onErr}) => onErr(consumer))),
    onComplete: consumer => ofPromise(promise.then(value => {
        consumer(value);
        return value;
    })),
    inspect: () => `Result.Async(${promise.then(inspect)})`
});

/**
 * {@link https://github.com/RyanDur/sand/blob/d6f399e6f5bbc3c6be3b741bcb9cbd630cf79677/src/lib/asyncResult.ts#L6 | orNull Implementation}
 * ```ts
 * const successfulResult = await asyncResult.success('some value').map(value => value + ', another value');
 * successfulResult.orNull(); // produces: "some value, another value"
 * successfulResult.failureOrElse('definitely this'); // produces: "definitely this"
 * ```
 * */
const success = <SUCCESS, FAILURE>(data: SUCCESS): Result.Async<SUCCESS, FAILURE> => ofPromise(Promise.resolve(result.ok(data)));

/**
 * ```ts
 * const failureResult = await asyncResult.failure('some err').mapErr(value => value + ', another err');
 * failureResult.orNull(); // produces: null
 * failureResult.failureOrElse('Not this'); // produces: "some err, another err"
 * ```
 * */
const failure = <SUCCESS, FAILURE>(reason: FAILURE): Result.Async<SUCCESS, FAILURE> => ofPromise(Promise.resolve(result.err(reason)));

/**
 * ```ts
 * const successfulResult = await asyncResult.of(Promise.resolve('some value')).map(value => value + ', another value');
 * successfulResult.orNull(); // produces: "some value, another value"
 * successfulResult.failureOrElse('definitely this'); // produces: "definitely this"
 * ```
 * ```ts
 * const failureResult = await asyncResult.of(Promise.reject('some err')).mapErr(value => value + ', another err');
 * failureResult.orNull(); // produces: null
 * failureResult.failureOrElse('Not this'); // produces: "some err, another err"
 * ```
 * */
const of = <SUCCESS, FAILURE>(promise: Promise<SUCCESS>): Result.Async<SUCCESS, FAILURE> => ofPromise(promise
    .then(value => result.ok(value))
    .catch(reason => result.err(reason)));

/**
 * The AsyncResult is something that [Damien LeBerrigaud](https://github.com/dam5s) has introduced me to. I had the chance
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