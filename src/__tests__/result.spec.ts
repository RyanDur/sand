import {expect} from 'chai';
import * as faker from 'faker';
import {result} from '../result';

const test = it;

describe('The Result', () => {
    const data = faker.lorem.sentence();
    const explanation = faker.lorem.sentence();

    test('for an Ok', () => {
        const okResult = result.ok(data);

        expect(okResult.value()).to.eql(result.okValue(data));
        expect(okResult.orNull()).to.eql(data);
        expect(okResult.orElse(explanation)).to.eql(data);

        expect(okResult.onOk(value => expect(value).to.eql(data)).value()).to.eql(okResult.value());
        expect(okResult.onErr(() => expect.fail('this should not happen')).value()).to.eql(okResult.value());

        expect(okResult.map(data => data + explanation).value()).to.eql(result.okValue(data + explanation));
        expect(okResult.mapError(() => expect.fail('this should not happen')).value()).to.eql(okResult.value());

        expect(okResult.flatMap(data => result.okValue(data + explanation)).value()).to.eql(result.okValue(data + explanation));
        expect(okResult.flatMapError(() => expect.fail('this should not happen'))
            .value()).to.eql(okResult.value());
    });

    test('for an Err', () => {
        const errResult = result.err(explanation);

        expect(errResult.value()).to.eql(result.errValue(explanation));
        expect(errResult.orNull()).to.be.null;
        expect(errResult.orElse(data)).to.eql(data);

        expect(errResult.onOk(() => expect.fail('this should not happen')).value()).to.eql(errResult.value());
        expect(errResult.onErr(value => expect(value).to.eql(explanation)).value()).to.eql(errResult.value());

        expect(errResult.map(() => expect.fail('this should not happen')).value()).to.eql(errResult.value());
        expect(errResult.mapError(explanation => explanation + data).value()).to.eql(result.errValue(explanation + data));

        expect(errResult.flatMap(() => result.errValue('this will not happen')).value()).to.eql(errResult.value());
        expect(errResult.flatMapError(explanation => result.errValue(explanation + data)).value())
            .to.eql(result.errValue(explanation + data));
    });
});