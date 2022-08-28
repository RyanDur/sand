import {maybe, nothing, some} from '../maybe';
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
    SOMETHING,
    "", // eslint-disable-line
    '',
    ``  // eslint-disable-line
].map(expectMaybeToBe(SOMETHING));

describe('the Maybe', () => {
    [...nones, ...somes].forEach(({value, expectation}) => {
        const maybeValue = maybe(value);
        test(`${maybeValue.isNothing ? `${value} is` : ''} ${maybeValue.inspect()} `, () =>
            expect(maybeValue.map(String).map(value => `SOME(${value})`).orElse(NOTHING)).toEqual(expectation));
    });

    const value1 = faker.lorem.sentence();
    const value2 = faker.lorem.sentence();

    test('mBind', () => {
        expect(maybe(value1).mBind(inner => maybe(`${inner}, ${value2}`)).orNull())
            .toEqual(`${value1}, ${value2}`);

        expect(maybe().mBind(() => fail('This should not happen')).orElse(NOTHING)).toEqual(NOTHING);
    });

    test('custom none type discriminator', () => {
        expect(maybe(value1, false).mBind(() => fail('This should not happen')).orElse(NOTHING)).toEqual(NOTHING);

        const something = {a: faker.lorem.sentence()};

        expect(maybe(something, true).mBind(inner => maybe(`${inner.a}, ${value2}`)).orNull())
            .toEqual(`${something.a}, ${value2}`);
    });

    test('or', () => {
        expect(nothing().or(() => some(SOMETHING)).orElse(NOTHING)).toEqual(SOMETHING);

        expect((maybe(SOMETHING)).or(() => fail('this should not happen')).orElse(NOTHING)).toBe(SOMETHING);
    });

    test('toResult', () => {
        expect(nothing().toResult().isSuccess).toEqual(false);
        expect(nothing().toResult().inspect()).toEqual('Err(undefined)');

        expect(maybe(SOMETHING).toResult().isSuccess).toBe(true);
        expect(maybe(SOMETHING).toResult().inspect()).toEqual(`Ok(${SOMETHING})`);
    });

    test('custom nothing definition', () => {
        expect(maybe({type: SOMETHING},  false).toResult().isSuccess).toBe(false);
        expect(maybe(SOMETHING).toResult().inspect()).toEqual(`Ok(${SOMETHING})`);
    });
});
