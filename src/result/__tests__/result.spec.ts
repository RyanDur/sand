import {err, errResult, explanation, ok, okResult} from '../index';
import {expect} from 'chai';
import * as faker from 'faker';

const test = it;

describe('The Result', () => {
    const initial = faker.lorem.sentence();
    const sentence = faker.lorem.sentence();

    test('an Ok result', () => {
        const result = okResult(initial);
        const expected = err(explanation(sentence, [new Error()]));

        expect(result.orNull()?.isOk).to.be.true;
        expect(result.map(() => expected).orNull()).to.eql(expected);
        expect(result.mapError(() => expected).orNull()).to.eql(result.orNull())
    });

    test('an Err result', () => {
        const result = errResult(initial);
        const expected = ok(sentence);

        expect(result.orNull()?.isOk).to.be.false;
        expect(result.map(() => expected).orNull()).to.eql(result.orNull());
        expect(result.mapError(() => expected).orNull()).to.eql(expected)
    });
});