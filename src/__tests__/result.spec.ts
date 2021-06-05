import {expect} from 'chai';
import * as faker from 'faker';
import {result} from '../result';
import {explanation} from '../explanantion';

const test = it;

describe('The Result', () => {
    const data = faker.lorem.sentence();
    const reason = faker.lorem.sentence();

    test('for an Ok', () => {
        const isOk = () => true;
        const okResult = result(isOk, explanation);
        const aResult = okResult(data);

        expect(aResult.orNull()).to.eql(data);
        expect(aResult.orElse(reason)).to.eql(data);

        expect(aResult.onOk(value => expect(value).to.eql(data)).orElse(reason)).to.eql(data);
        expect(aResult.onErr(() => expect.fail('this should not happen')).orElse(reason)).to.eql(data);

        expect(aResult.map(value => value + reason).orElse(reason)).to.eql(data + reason);
        expect(aResult.mapErr(() => expect.fail('this should not happen')).orElse(reason)).to.eql(data);

        expect(aResult.flatMap(value => okResult(value + reason)).orElse(reason)).to.eql(data + reason);
        expect(aResult.flatMapErr(() => expect.fail('this should not happen')).orElse(reason)).to.eql(data);
    });

    test('for an Err', () => {
        const notOk = () => false;
        const errResult = result(notOk, explanation);
        const aResult = errResult(reason);

        expect(aResult.orNull()).to.be.null;
        expect(aResult.orElse(data)).to.eql(data);

        expect(aResult.onOk(() => expect.fail('this should not happen')).orElse(data)).to.eql(data);
        expect(aResult.onErr(value => expect(value.orElse(data)).to.eql(reason)).isOk).to.be.false;

        expect(aResult.map(() => expect.fail('this should not happen') as string).orElse(data)).to.eql(data);
        expect(aResult.mapErr(exp => explanation(exp.orElse(data) + data)).orElseErr(explanation(data)).orElse(data))
            .to.eql(reason + data);

        expect(aResult.flatMap(() => errResult('this will not happen')).orElse(data)).to.eql(data);
        expect((aResult.flatMapErr(explanation => errResult(explanation.orNull() + data)).orElseErr(explanation(data))).orNull())
            .to.eql(reason + data);
    });
});