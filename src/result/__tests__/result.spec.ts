import {expect} from 'chai';
import * as faker from 'faker';
import {result} from '../index';

const test = it;

describe('The Result', () => {
    const initial = faker.lorem.sentence();
    const reason = faker.lorem.sentence();

    test('an Ok result', () => {
        const okResult = result.ok(initial);

        expect(okResult.value()).to.eql(result.okValue(initial));
        expect(okResult.orNull()).to.eql(initial);
        expect(okResult.orElse(reason)).to.eql(initial);

        expect(okResult.map(data => data + reason).value())
            .to.eql(result.okValue(initial + reason));
        expect(okResult.flatMap(data => result.okValue(data + reason)).value())
            .to.eql(result.okValue(initial + reason));

        expect(okResult.mapError(() => 'this will not happen').value()).to.eql(okResult.value());
        expect(okResult.flatMapError(() => result.okValue('this will not happen'))
            .value()).to.eql(okResult.value());
    });

    test('an Err result', () => {
        const errResult = result.err(reason);

        expect(errResult.value()).to.eql(result.errValue(reason));
        expect(errResult.orNull()).to.be.null;
        expect(errResult.orElse(initial)).to.eql(initial);

        expect(errResult.map(() => 'this will not happen').value())
            .to.eql(errResult.value());
        expect(errResult.flatMap(() => result.errValue('this will not happen')).value())
            .to.eql(errResult.value());

        expect(errResult.mapError(data => data + initial).value()).to.eql(result.errValue(reason + initial));
        expect(errResult.flatMapError(data => result.errValue(data + initial)).value())
            .to.eql(result.errValue(reason + initial));
    });
});