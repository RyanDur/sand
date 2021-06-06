import {asyncResult} from '../asyncResult';
import {expect} from 'chai';
import faker from 'faker';

const test = it;

describe('the Async Result', () => {
    const FAIL = 'FAIL';
    const data = faker.lorem.sentence();
    const reason = faker.lorem.sentence();

    test('for a Success', async () => {
        const aSuccess = asyncResult.of(Promise.resolve(data));

        const resultMap = await aSuccess.map(inner => inner + reason).orElse(FAIL);
        expect(resultMap).to.eql(data + reason);

        const resultMapFailure = await aSuccess.mapFailure(() => expect.fail('this should not happen')).orElse(FAIL);
        expect(resultMapFailure).to.eql(data);

        const resultFlatMap = await aSuccess.flatMap(inner => asyncResult.of(Promise.resolve(inner + reason))).orElse(FAIL);
        expect(resultFlatMap).to.eql(data + reason);

        const resultFlatMapFailure = await aSuccess.flatMapFailure(() => expect.fail('this should not happen')).orElse(FAIL);
        expect(resultFlatMapFailure).to.eql(data);

        const resultOnSuccess = await aSuccess.onSuccess(value => expect(value).to.eql(data)).orElse(FAIL);
        expect(resultOnSuccess).to.eql(data);

        const resultOnFailure = await aSuccess.onFailure(() => expect.fail('this should not happen')).orElse(FAIL);
        expect(resultOnFailure).to.eql(data);

        const resultOnComplete = await aSuccess.onComplete(async value => expect(value).to.eql(data)).orElse(FAIL);
        expect(resultOnComplete).to.eql(data);
    });

    test('for a Failure', async () => {
        const aFailure = asyncResult.of(Promise.reject(reason));

        const resultMap = await aFailure.map(() => expect.fail('this should not happen')).value();
        expect(resultMap.orElseErr(FAIL)).to.eql(reason);

        const resultMapFailure = await aFailure.mapFailure(inner => inner + data).value();
        expect(resultMapFailure.orElseErr(FAIL)).to.eql(reason + data);

        const resultFlatMap = await aFailure.flatMap(() => expect.fail('this should not happen')).value();
        expect(resultFlatMap.orElseErr(FAIL)).to.eql(reason);

        const resultFlatMapFailure = await aFailure.flatMapFailure(inner => asyncResult.of(Promise.reject(inner + data))).value();
        expect(resultFlatMapFailure.orElseErr(FAIL)).to.eql(reason + data);

        const resultOnFailure = await aFailure.onFailure(value => expect(value).to.eql(reason)).value();
        expect(resultOnFailure.orElseErr(FAIL)).to.eql(reason);

        const resultOnSuccess = await aFailure.onSuccess(() => expect.fail('this should not happen')).value();
        expect(resultOnSuccess.orElseErr(FAIL)).to.eql(reason);

        const resultOnComplete = await aFailure.onComplete(async value => expect(value).to.eql(reason)).value();
        expect(resultOnComplete.orElseErr(FAIL)).to.eql(reason);
    });
});