import {expect} from 'chai';
import {maybe} from '../maybe';
import * as faker from 'faker';

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

const expectMaybeToBe = (expectation: 'SOME' | 'NONE') => <T>(value: T) => expectation === SOME ?
    {value, expectation: `SOME(${String(value)})`} : {value, expectation};

const nones = [
    NaN,
    null,
    undefined
].map(expectMaybeToBe(NONE));
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
].map(expectMaybeToBe(SOME));

describe('the Maybe', () => {
    [...nones, ...somes].forEach(({value, expectation}) => {
        const maybeValue = maybe.of(value);
        test(`${maybeValue.isNone ? `${value} is` : ''} ${maybeValue.inspect()} `, () =>
            expect(maybeValue.map(String).map(value => `SOME(${value})`).orElse(NONE)).to.equal(expectation));
    });

    const value1 = faker.lorem.sentence();
    const value2 = faker.lorem.sentence();

    test('flatMap', () => {
        expect(maybe.of(value1).flatMap(inner => maybe.of(`${inner}, ${value2}`)).orNull())
            .to.eql(`${value1}, ${value2}`);

        expect(maybe.of().flatMap(() => expect.fail('This should not happen')).orElse(NONE)).to.eql(NONE);
    });

    test('custom none type discriminator', () => {
        const isNone = (value: unknown) => typeof value === 'string';
        expect(maybe.of(value1, isNone).flatMap(() => expect.fail('This should not happen')).orElse(NONE)).to.eql(NONE);

        const notNoneValue = {a: faker.lorem.sentence()};

        expect(maybe.of(notNoneValue, isNone).flatMap(inner => maybe.of(`${inner.a}, ${value2}`)).orNull())
            .to.eql(`${notNoneValue.a}, ${value2}`);
    });
});