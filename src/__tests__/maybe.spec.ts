import {maybe} from '../maybe';
import * as faker from 'faker';

const SOMETHING = 'SOMETHING';
const NOTHING = 'NOTHING';

const lambda = () => NOTHING;
const functionExpression = function () {
    return NOTHING;
};

function functionDeclaration() {
    return NOTHING;
}

const expectMaybeToBe = (expectation: 'SOMETHING' | 'NOTHING') => <T>(value: T) => expectation === SOMETHING ?
    {value, expectation: `SOME(${String(value)})`} : {value, expectation};

const nones = [
    NaN,
    null,
    undefined
].map(expectMaybeToBe(NOTHING));
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
    SOMETHING,
    "", // eslint-disable-line
    '',
    ``  // eslint-disable-line
].map(expectMaybeToBe(SOMETHING));

describe('the Maybe', () => {
    [...nones, ...somes].forEach(({value, expectation}) => {
        const maybeValue = maybe.of(value);
        test(`${maybeValue.isNothing ? `${value} is` : ''} ${maybeValue.inspect()} `, () =>
            expect(maybeValue.map(String).map(value => `SOME(${value})`).orElse(NOTHING)).toEqual(expectation));
    });

    const value1 = faker.lorem.sentence();
    const value2 = faker.lorem.sentence();

    test('flatMap', () => {
        expect(maybe.of(value1).flatMap(inner => maybe.of(`${inner}, ${value2}`)).orNull())
            .toEqual(`${value1}, ${value2}`);

        expect(maybe.of().flatMap(() => fail('This should not happen')).orElse(NOTHING)).toEqual(NOTHING);
    });

    test('custom none type discriminator', () => {
        const isNothing = (value: unknown) => typeof value === 'string';
        expect(maybe.of(value1, isNothing).flatMap(() => fail('This should not happen')).orElse(NOTHING)).toEqual(NOTHING);

        const something = {a: faker.lorem.sentence()};

        expect(maybe.of(something, isNothing).flatMap(inner => maybe.of(`${inner.a}, ${value2}`)).orNull())
            .toEqual(`${something.a}, ${value2}`);
    });
});