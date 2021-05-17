import {asyncResult} from '../asyncResult';
import {expect} from 'chai';
import faker from 'faker';

const test = it;

describe('the Async Result', () => {
    const data = faker.lorem.sentence();
    const explanation = faker.lorem.sentence();
    const successValue = asyncResult.successValue(data);
    const failValue = asyncResult.failureValue(explanation);

    test('for a Success', async () => {
        const aSuccess = asyncResult.success(data);

        expect(await aSuccess.map(inner => inner + explanation).value())
            .to.eql(asyncResult.successValue(data + explanation));
        expect(await aSuccess.mapFailure(() => expect.fail('this should not happen')).value())
            .to.eql(successValue);

        expect(await aSuccess.flatMap(inner => asyncResult.success(inner + explanation)).value())
            .to.eql(asyncResult.successValue(data + explanation));
        expect(await aSuccess.flatMapFailure(() => expect.fail('this should not happen')).value())
            .to.eql(successValue);

        expect(await aSuccess.onSuccess(value => expect(value).to.eql(data)).value())
            .to.eql(successValue);
        expect(await aSuccess.onFailure(() => expect.fail('this should not happen')).value())
            .to.eql(successValue);

        expect(await aSuccess.onComplete(async value => expect(value).to.eql(successValue)).value())
            .to.eql(successValue);
    });

    test('for a Failure', async () => {
        const aFailure = asyncResult.failure(explanation);

        expect(await aFailure.mapFailure(inner => inner + data).value())
            .to.eql(asyncResult.failureValue(explanation + data));
        expect(await aFailure.map(() => expect.fail('this should not happen')).value())
            .to.eql(failValue);

        expect(await aFailure.flatMapFailure(inner => asyncResult.failure(inner + data)).value())
            .to.eql(asyncResult.failureValue(explanation + data));
        expect(await aFailure.flatMap(() => expect.fail('this should not happen')).value())
            .to.eql(failValue);

        expect(await aFailure.onFailure(value => expect(value).to.eql(explanation)).value())
            .to.eql(failValue);
        expect(await aFailure.onSuccess(() => expect.fail('this should not happen')).value())
            .to.eql(failValue);

        expect(await aFailure.onComplete(async value => expect(value).to.eql(failValue)).value())
            .to.eql(failValue);
    });

    test('handles a promise', async () => {
        expect(await asyncResult.ofPromise(Promise.resolve(data)).value()).to.eql(successValue);

        expect(await asyncResult.ofPromise(Promise.reject(explanation)).value()).to.eql(failValue);
    });
});