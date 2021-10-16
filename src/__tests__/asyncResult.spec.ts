import {asyncResult} from '../asyncResult';
import faker from 'faker';

describe('the Async Result', () => {
    const FAIL = 'FAIL';
    const data = faker.lorem.sentence();
    const reason = faker.lorem.sentence();

    describe('success', () => {
        test('for a promise', async () => {
            const aSuccess = asyncResult.of(Promise.resolve(data));

            const resultMap = await aSuccess.map(inner => inner + reason).orElse(FAIL);
            expect(resultMap).toEqual(data + reason);

            const resultMapFailure = await aSuccess.mapFailure(() => fail('this should not happen')).orElse(FAIL);
            expect(resultMapFailure).toEqual(data);

            const resultFlatMap = await aSuccess.flatMap(inner => asyncResult.of(Promise.resolve(inner + reason))).orElse(FAIL);
            expect(resultFlatMap).toEqual(data + reason);

            const resultFlatMapFailure = await aSuccess.flatMapFailure(() => fail('this should not happen')).orElse(FAIL);
            expect(resultFlatMapFailure).toEqual(data);

            const resultOnSuccess = await aSuccess.onSuccess(value => expect(value).toEqual(data)).orElse(FAIL);
            expect(resultOnSuccess).toEqual(data);

            const resultOnFailure = await aSuccess.onFailure(() => fail('this should not happen')).orElse(FAIL);
            expect(resultOnFailure).toEqual(data);

            await aSuccess.onComplete(value => {
                if (value.isOk) expect(value.data).toEqual(data);
                else fail('this should not happen');
            }).orElse(FAIL);
        });

        test('directly', async () => {
            const aSuccess = asyncResult.success(data);

            const resultMap = await aSuccess.map(inner => inner + reason).orElse(FAIL);
            expect(resultMap).toEqual(data + reason);

            const resultMapFailure = await aSuccess.mapFailure(() => fail('this should not happen')).orElse(FAIL);
            expect(resultMapFailure).toEqual(data);

            const resultFlatMap = await aSuccess.flatMap(inner => asyncResult.of(Promise.resolve(inner + reason))).orElse(FAIL);
            expect(resultFlatMap).toEqual(data + reason);

            const resultFlatMapFailure = await aSuccess.flatMapFailure(() => fail('this should not happen')).orElse(FAIL);
            expect(resultFlatMapFailure).toEqual(data);

            const resultOnSuccess = await aSuccess.onSuccess(value => expect(value).toEqual(data)).orElse(FAIL);
            expect(resultOnSuccess).toEqual(data);

            const resultOnFailure = await aSuccess.onFailure(() => fail('this should not happen')).orElse(FAIL);
            expect(resultOnFailure).toEqual(data);

            await aSuccess.onComplete(value => {
                if (value.isOk) expect(value.data).toEqual(data);
                else fail('this should not happen');
            }).orElse(FAIL);
        });
    });

    describe('failure', () => {
        test('for a Promise', async () => {
            const aFailure = asyncResult.of(Promise.reject(reason));

            const resultMap = await aFailure.map(() => fail('this should not happen')).value();
            expect(resultMap.orElseErr(FAIL)).toEqual(reason);

            const resultMapFailure = await aFailure.mapFailure(inner => inner + data).value();
            expect(resultMapFailure.orElseErr(FAIL)).toEqual(reason + data);

            const resultFlatMap = await aFailure.flatMap(() => fail('this should not happen')).value();
            expect(resultFlatMap.orElseErr(FAIL)).toEqual(reason);

            const resultFlatMapFailure = await aFailure.flatMapFailure(inner => asyncResult.of(Promise.reject(inner + data))).value();
            expect(resultFlatMapFailure.orElseErr(FAIL)).toEqual(reason + data);

            const resultOnFailure = await aFailure.onFailure(value => expect(value).toEqual(reason)).value();
            expect(resultOnFailure.orElseErr(FAIL)).toEqual(reason);

            const resultOnSuccess = await aFailure.onSuccess(() => fail('this should not happen')).value();
            expect(resultOnSuccess.orElseErr(FAIL)).toEqual(reason);

            await aFailure.onComplete(value => {
                if (value.isOk) fail('this should not happen');
                else expect(value.explanation).toEqual(reason);
            });
        });

        test('directly', async () => {
            const aFailure = asyncResult.failure(reason);

            const resultMap = await aFailure.map(() => {
                throw new Error('this should not happen');
            }).value();
            expect(resultMap.orElseErr(FAIL)).toEqual(reason);

            const resultMapFailure = await aFailure.mapFailure(inner => inner + data).value();
            expect(resultMapFailure.orElseErr(FAIL)).toEqual(reason + data);

            const resultFlatMap = await aFailure.flatMap(() => {
                throw new Error('this should not happen');
            }).value();
            expect(resultFlatMap.orElseErr(FAIL)).toEqual(reason);

            const resultFlatMapFailure = await aFailure.flatMapFailure(inner => asyncResult.of(Promise.reject(inner + data))).value();
            expect(resultFlatMapFailure.orElseErr(FAIL)).toEqual(reason + data);

            const resultOnFailure = await aFailure.onFailure(value => expect(value).toEqual(reason)).value();
            expect(resultOnFailure.orElseErr(FAIL)).toEqual(reason);

            const resultOnSuccess = await aFailure.onSuccess(() => {
                throw new Error('this should not happen');
            }).value();
            expect(resultOnSuccess.orElseErr(FAIL)).toEqual(reason);

            await aFailure.onComplete(value => {
                if (value.isOk) fail('this should not happen');
                else expect(value.explanation).toEqual(reason);
            });
        });
    });

    describe('on loading', () => {
       test('a success', done => {
           const aSuccess = asyncResult.success(data);
           const isLoading = jest.fn();

           aSuccess.onLoading(isLoading).onSuccess(() => {
               expect(isLoading).toHaveBeenNthCalledWith(1, true);
               expect(isLoading).toHaveBeenNthCalledWith(2, false);
               done();
           });
       });

       test('a failure', done => {
           const aSuccess = asyncResult.failure(data);
           const isLoading = jest.fn();

           aSuccess.onLoading(isLoading).onFailure(() => {
               expect(isLoading).toHaveBeenNthCalledWith(1, true);
               expect(isLoading).toHaveBeenNthCalledWith(2, false);
               done();
           });
       });
    });
});