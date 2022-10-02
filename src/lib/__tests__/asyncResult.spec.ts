import {asyncResult} from '../asyncResult';
import faker from 'faker';
import {Result} from '../types';

describe('the Async Result', () => {
    const FAIL = 'FAIL';
    const data = {type: faker.lorem.sentence()};
    const reason = faker.lorem.sentence();
    const unexpected = () => fail('this should not happen');

    describe('success', () => {
        test('for a promise', async () => await testSuccess(asyncResult.of(Promise.resolve(data))));
        test('directly', async () => await testSuccess(asyncResult.success(data)));

        const testSuccess = async (aResult: Result.Async<{ type: string }, { cause: string }>) => {
            const resultMap = await aResult.map(inner => inner.type + reason).orNull();
            expect(resultMap).toEqual(data.type + reason);

            expect(await aResult.mBind(inner =>
                asyncResult.success(inner.type + reason)
            ).value).toEqual(data.type + reason);

            expect(await aResult.mBind(inner =>
                asyncResult.failure(inner.type + reason)
            ).value).toEqual(data.type + reason);

            const resultFlatMapFailure = await aResult.or(unexpected).orNull();
            expect(resultFlatMapFailure).toEqual(data);

            const isPending = jest.fn();
            await aResult.onPending(isPending).orNull();
            expect(isPending).toHaveBeenCalledWith(true);
            expect(isPending).toHaveBeenLastCalledWith(false);

            const resultOnSuccess = await aResult.onSuccess(value => expect(value).toEqual(data)).orNull();
            expect(resultOnSuccess).toEqual(data);

            const resultOnFailure = await aResult.onFailure(unexpected).orElse({type: FAIL});
            expect(resultOnFailure).toEqual(data);

            await aResult.onComplete(result => {
                if (result.isSuccess) expect(result.value).toEqual(data);
                else expect(result.value).not.toEqual(data);
            }).orNull();
        };
    });

    describe('failure', () => {
        test('for a Promise', async () => await testFailure(asyncResult.of(Promise.reject(reason))));
        test('directly', async () => await testFailure(asyncResult.failure(reason)));

        const testFailure = async (aResult: Result.Async<string, string>) => {

            const resultFlatMap = await aResult.mBind(unexpected).value;
            expect(resultFlatMap).toEqual(reason);

            expect(await aResult.or(inner =>
                asyncResult.failure(inner + data)
            ).value).toEqual(reason + data);

            expect(await aResult.or(inner =>
                asyncResult.success(inner + data)
            ).value).toEqual(reason + data);

            const isLoading = jest.fn();
            await aResult.onPending(isLoading).orNull();
            expect(isLoading).toHaveBeenNthCalledWith(1, true);
            expect(isLoading).toHaveBeenNthCalledWith(2, false);

            const resultOnSuccess = await aResult.onSuccess(unexpected).value;
            expect(resultOnSuccess).toEqual(reason);

            const resultOnFailure = await aResult.onFailure(value => expect(value).toEqual(reason)).value;
            expect(resultOnFailure).toEqual(reason);

            await aResult.onComplete(result => {
                if (result.isSuccess) fail('this should not happen');
                else expect(result.value).toEqual(reason);
            });
        };
    });
});
