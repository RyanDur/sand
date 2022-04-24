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

            const resultFlatMap = await aResult.mBind(inner =>
                asyncResult.of(Promise.resolve(inner + reason))
            ).orNull();
            expect(resultFlatMap).toEqual(data + reason);

            const resultFlatMapFailure = await aResult.or(unexpected).orNull();
            expect(resultFlatMapFailure).toEqual(data);

            const isPending = jest.fn();
            await aResult.onPending(isPending).orNull();
            expect(isPending).toHaveBeenCalledWith(true);
            expect(isPending).toHaveBeenLastCalledWith(false);

            const resultOnSuccess = await aResult.onSuccess(value => expect(value).toEqual(data)).orNull();
            expect(resultOnSuccess).toEqual(data);

            const resultOnFailure = await aResult.onFailure(unexpected).orElse(FAIL);
            expect(resultOnFailure).toEqual(data);

            await aResult.onComplete(result => {
                if (result.isOk) expect(result.value).toEqual(data);
                else fail('this should not happen');
            }).orNull();
        };
    });

    describe('failure', () => {
        test('for a Promise', async () => await testFailure(asyncResult.of(Promise.reject(reason))));
        test('directly', async () => await testFailure(asyncResult.failure(reason)));

        const testFailure = async (aResult: Result.Async<string, string>) => {

            const resultFlatMap = await aResult.mBind(unexpected).value;
            expect(resultFlatMap.value).toEqual(reason);

            const resultOrFailure = await aResult.or(inner =>
                asyncResult.of(Promise.reject(inner + data))
            ).value;
            expect(resultOrFailure.value).toEqual(reason + data);

            const isLoading = jest.fn();
            await aResult.onPending(isLoading).orNull();
            expect(isLoading).toHaveBeenNthCalledWith(1, true);
            expect(isLoading).toHaveBeenNthCalledWith(2, false);

            const resultOnSuccess = await aResult.onSuccess(unexpected).value;
            expect(resultOnSuccess.value).toEqual(reason);

            const resultOnFailure = await aResult.onFailure(value => expect(value).toEqual(reason)).value;
            expect(resultOnFailure.value).toEqual(reason);

            await aResult.onComplete(result => {
                if (result.isOk) fail('this should not happen');
                else expect(result.value).toEqual(reason);
            });
        };
    });
});