import {asyncResult} from '../asyncResult';
import faker from 'faker';
import {Result} from '../types';

describe('the Async Result', () => {
    const FAIL = 'FAIL';
    const data = faker.lorem.sentence();
    const reason = faker.lorem.sentence();
    const unexpected = () => fail('this should not happen');

    describe('success', () => {
        test('for a promise', async () => await testSuccess(asyncResult.of(Promise.resolve(data))));
        test('directly', async () => await testSuccess(asyncResult.success(data)));

        const testSuccess = async (aResult: Result.Async<string, string>) => {
            const resultMap = await aResult.map(inner => inner + reason).orNull();
            expect(resultMap).toEqual(data + reason);

            const resultMapFailure = await aResult.mapFailure(unexpected).orNull();
            expect(resultMapFailure).toEqual(data);

            const resultFlatMap = await aResult.flatMap(inner =>
                asyncResult.of(Promise.resolve(inner + reason))
            ).orNull();
            expect(resultFlatMap).toEqual(data + reason);

            const resultFlatMapFailure = await aResult.flatMapFailure(unexpected).orNull();
            expect(resultFlatMapFailure).toEqual(data);

            const isPending = jest.fn();
            await aResult.onPending(isPending).orNull();
            expect(isPending).toHaveBeenCalledWith(true);
            expect(isPending).toHaveBeenLastCalledWith(false);

            const resultOnSuccess = await aResult.onSuccess(value => expect(value).toEqual(data)).orNull();
            expect(resultOnSuccess).toEqual(data);

            const resultOnFailure = await aResult.onFailure(unexpected).orElse(FAIL);
            expect(resultOnFailure).toEqual(data);

            await aResult.onComplete(value => {
                if (value.isOk) expect(value.data).toEqual(data);
                else fail('this should not happen');
            }).orNull();
        };
    });

    describe('failure', () => {
        test('for a Promise', async () => await testFailure(asyncResult.of(Promise.reject(reason))));
        test('directly', async () => await testFailure(asyncResult.failure(reason)));

        const testFailure = async (aResult: Result.Async<string, string>) => {
            const resultMap = await aResult.map(unexpected).failureOrElse(FAIL);
            expect(resultMap).toEqual(reason);

            const resultMapFailure = await aResult.mapFailure(inner => inner + data).failureOrElse(FAIL);
            expect(resultMapFailure).toEqual(reason + data);

            const resultFlatMap = await aResult.flatMap(unexpected).failureOrElse(FAIL);
            expect(resultFlatMap).toEqual(reason);

            const resultFlatMapFailure = await aResult.flatMapFailure(inner =>
                asyncResult.of(Promise.reject(inner + data))
            ).failureOrElse(FAIL);
            expect(resultFlatMapFailure).toEqual(reason + data);

            const isLoading = jest.fn();
            await aResult.onPending(isLoading).orNull();
            expect(isLoading).toHaveBeenNthCalledWith(1, true);
            expect(isLoading).toHaveBeenNthCalledWith(2, false);

            const resultOnSuccess = await aResult.onSuccess(unexpected).failureOrElse(FAIL);
            expect(resultOnSuccess).toEqual(reason);

            const resultOnFailure = await aResult.onFailure(value => expect(value).toEqual(reason)).failureOrElse(FAIL);
            expect(resultOnFailure).toEqual(reason);

            await aResult.onComplete(value => {
                if (value.isOk) fail('this should not happen');
                else expect(value.reason).toEqual(reason);
            });
        };
    });
});