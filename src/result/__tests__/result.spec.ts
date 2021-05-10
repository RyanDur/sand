import {err, errResult, explanation, ok, okResult} from '../index';
import {expect} from 'chai';
import * as faker from 'faker';

const test = it;

describe('The Result', () => {
    const initial = faker.lorem.sentence();
    const sentence = faker.lorem.sentence();
    const resultErr = errResult<string, unknown>(initial);
    const expectedOk = ok(sentence);
    const resultOk = okResult(initial);
    const expectedErr = err(explanation(sentence, [new Error()]));

    test('an Ok result', () => {
        expect(resultOk.orNull()?.isOk).to.be.true;
        expect(resultOk.map(() => expectedErr).orNull()).to.eql(expectedErr);
        expect(resultOk.flatMap(() => resultErr)).to.eql(resultErr);
        expect(resultOk.mapError(() => expectedErr).orNull()).to.eql(resultOk.orNull())
        expect(resultOk.flatMapError(() => resultErr).orNull()).to.eql(resultOk.orNull())
    });

    test('an Err result', () => {
        expect(resultErr.orNull()?.isOk).to.be.false;
        expect(resultErr.map(() => expectedOk).orNull()).to.eql(resultErr.orNull());
        expect(resultErr.flatMap(() => resultOk).orNull()).to.eql(resultErr.orNull());
        expect(resultErr.mapError(() => expectedOk).orNull()).to.eql(expectedOk)
        expect(resultErr.flatMapError(() => resultOk)).to.eql(resultOk)
    });
});