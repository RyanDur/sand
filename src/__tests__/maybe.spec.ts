import {maybe} from '../maybe';
import * as faker from 'faker';

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
            expect(maybeValue.map(String).map(value => `SOME(${value})`).orElse(NONE)).toEqual(expectation));
    });

    const value1 = faker.lorem.sentence();
    const value2 = faker.lorem.sentence();

    test('flatMap', () => {
        expect(maybe.of(value1).flatMap(inner => maybe.of(`${inner}, ${value2}`)).orNull())
            .toEqual(`${value1}, ${value2}`);

        expect(maybe.of().flatMap(() => fail('This should not happen')).orElse(NONE)).toEqual(NONE);
    });

    test('custom none type discriminator', () => {
        const isNone = (value: unknown) => typeof value === 'string';
        expect(maybe.of(value1, isNone).flatMap(() => fail('This should not happen')).orElse(NONE)).toEqual(NONE);

        const notNoneValue = {a: faker.lorem.sentence()};

        expect(maybe.of(notNoneValue, isNone).flatMap(inner => maybe.of(`${inner.a}, ${value2}`)).orNull())
            .toEqual(`${notNoneValue.a}, ${value2}`);
    });
});