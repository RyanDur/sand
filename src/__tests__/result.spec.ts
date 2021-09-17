import * as faker from 'faker';
import {result} from '../result';
import {explanation} from '../explanantion';

describe('The Result', () => {
    const data = faker.lorem.sentence();
    const reason = faker.lorem.sentence();

    test('for an Ok', () => {
        const isOk = () => true;
        const okResult = result.of(isOk, explanation);
        const aResult = okResult(data);

        if (aResult.isOk) {
            expect(aResult.data).toEqual(data);
        } else fail('This should not happen');

        expect(aResult.orNull()).toEqual(data);
        expect(aResult.orElse(reason)).toEqual(data);

        expect(aResult.onOk(value => expect(value).toEqual(data)).orElse(reason)).toEqual(data);
        expect(aResult.onErr(() => fail('this should not happen')).orElse(reason)).toEqual(data);

        expect(aResult.map(value => value + reason).orElse(reason)).toEqual(data + reason);
        expect(aResult.mapErr(() => fail('this should not happen')).orElse(reason)).toEqual(data);

        expect(aResult.flatMap(value => okResult(value + reason)).orElse(reason)).toEqual(data + reason);
        expect(aResult.flatMapErr(() => fail('this should not happen')).orElse(reason)).toEqual(data);
    });

    test('for an Err', () => {
        const notOk = () => false;
        const errResult = result.of(notOk, explanation);
        const aResult = errResult(reason);

        if (!aResult.isOk) {
            expect(aResult.explanation.orNull()).toEqual(reason);
        } else fail('This should not happen');

        expect(aResult.orNull()).toBeNull();
        expect(aResult.orElse(data)).toEqual(data);

        expect(aResult.onOk(() => fail('this should not happen')).orElse(data)).toEqual(data);
        expect(aResult.onErr(value => expect(value.orElse(data)).toEqual(reason)).isOk).toBe(false);

        expect(aResult.map(() => fail('this should not happen') as string).orElse(data)).toEqual(data);
        expect(aResult.mapErr(exp => explanation(exp.orElse(data) + data)).orElseErr(explanation(data)).orElse(data))
            .toEqual(reason + data);

        expect(aResult.flatMap(() => errResult('this will not happen')).orElse(data)).toEqual(data);
        expect((aResult.flatMapErr(explanation => errResult(explanation.orNull() + data)).orElseErr(explanation(data))).orNull())
            .toEqual(reason + data);
    });
});