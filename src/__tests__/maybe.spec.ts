import {expect} from 'chai';
import {maybe} from '../maybe';

const test = it;

const SOME = 'SOME';
const NONE = 'NONE';

const lambda = () => NONE;
const functionExpression = function () {
    return NONE;
};

function functionDeclaration() {
    return NONE;
}

const setup = (expectation: 'SOME' | 'NONE') => <T>(value: T) => ({value, expectation});
const nones = [
    NaN,
    null,
    undefined
].map(setup(NONE));
const somes = [
    {},
    false,
    true,
    lambda,
    functionExpression,
    functionDeclaration,
    0,
    -0,
    5,
    -34,
    0n,
    -0n,
    46n,
    -346n,
    Symbol(),
    SOME,
    "", // eslint-disable-line
    '',
    ``  // eslint-disable-line
].map(setup(SOME));

describe('Maybe', () => {
    [...nones, ...somes].forEach(({value, expectation}) => {
        const maybeValue = maybe.of(value);
        test(`${maybeValue.inspect()} ${maybeValue.isNone ? `of value: ${value}` : ''}`, () =>
            expect(maybeValue.map(() => SOME).orElse(NONE)).to.equal(expectation));
    });

    const value1 = 'value 1';
    const value2 = 'value 2';

    test('flatMap', () => {
        expect(maybe.of(value1).flatMap(inner => maybe.of([inner, value2].join(', '))).orNull())
            .to.eql(`${value1}, ${value2}`);

        expect(maybe.of().flatMap(() => expect.fail('This should not happen')).orElse(NONE)).to.eql(NONE);
    });

    test('custom none type discriminator', () => {
        const isNone = (value: unknown) => typeof value === 'string';
        expect(maybe.of(value1, isNone).flatMap(() => expect.fail('This should not happen')).orElse(NONE)).to.eql(NONE);

        const notNoneValue = {a: 'not none value'};

        expect(maybe.of(notNoneValue, isNone).flatMap(inner => maybe.of([inner.a, value2].join(', '))).orNull())
            .to.eql(`${notNoneValue.a}, ${value2}`);
    });
});