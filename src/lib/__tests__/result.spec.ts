import * as faker from 'faker';
import {result} from '../result';

describe('The Result', () => {
    const data = faker.lorem.sentence();
    const reason = faker.lorem.sentence();

    test('for an Ok', () => {
        const aResult = result.ok(data);

        if (aResult.isOk) {
            expect(aResult.value).toEqual(data);
        } else fail('This should not happen');

        expect(aResult.orNull()).toEqual(data);
        expect(aResult.onOk(value => expect(value).toEqual(data)).orElse(reason)).toEqual(data);
        expect(aResult.onErr(() => fail('this should not happen')).orElse(reason)).toEqual(data);

        expect(aResult.orElse(reason)).toEqual(data);
        expect(aResult.map(value => value + reason).orElse(reason)).toEqual(data + reason);
        expect(aResult.mBind(value => result.ok(value + reason)).orElse(reason)).toEqual(data + reason);
        expect(aResult.or(() => fail('this should not happen')).orElse(reason)).toEqual(data);
    });

    test('for an Err', () => {
        const aResult = result.err(reason);

        if (!aResult.isOk) expect(aResult.value).toEqual(reason);
        else fail('This should not happen');

        expect(aResult.orNull()).toBeNull();
        expect(aResult.onOk(() => fail('this should not happen')).orElse(data)).toEqual(data);
        expect(aResult.onErr(value => expect(value).toEqual(reason)).isOk).toBe(false);

        expect(aResult.orElse(data)).toEqual(data);
        expect(aResult.map(() => 'this should not happen').orElse(data)).toEqual(data);
        expect(aResult.mBind(() => result.err('this will not happen')).orElse(data)).toEqual(data);
        expect(aResult.or(explanation => result.err(explanation + data)).value).toEqual(reason + data);
    });
});