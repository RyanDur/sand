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

const nothings = [
    NaN,
    null,
    undefined
];
const somethings = [
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
];

describe('the Maybe', () => {
    const thisShouldNotHappen = () => fail('this should not happen');
    const otherValue = faker.lorem.sentence();

    describe('something', () => {
        somethings.forEach(value => {
            const maybeValue = maybe(value);

            describe('why it is a monad', () => {
                test(`orElse: for ${value} should not provide the fallback value`, () =>
                    expect(maybeValue.orElse(SOMETHING)).toEqual(value));

                test(`map: for ${value} is ${maybeValue.inspect()} `, () =>
                    expect(maybeValue.map(String).map(() => SOMETHING).orElse(NOTHING)).toEqual(SOMETHING));

                test(`mBind: for ${value} should allow us to bind to another maybe`, () => {
                    expect(maybeValue.mBind(inner => some(`${inner}, ${otherValue}`)).orNull())
                        .toEqual(`${value}, ${otherValue}`);
                    expect(maybeValue.mBind(() => nothing()).orNull())
                        .toEqual(null);
                });

                test(`or: for ${value} is ${maybeValue.inspect()}`, () =>
                    expect(maybeValue.or(thisShouldNotHappen).orElse(NOTHING)).toBe(value));
            });

            test(`toResult: for ${value} is ${maybeValue.inspect()} should be a Failure`, () =>
                expect(maybeValue.toResult().isSuccess).toEqual(true));
        });
    });

    describe('nothing', () => {
        nothings.forEach(value => {
            const maybeValue = maybe(value);

            describe('why it is a monad', () => {
                test(`orElse: for ${value} should provide the fallback value`, () =>
                    expect(maybeValue.orElse(SOMETHING)).toEqual(SOMETHING));

                test(`map: for ${value} should be skipped`, () =>
                    expect(maybeValue.map(String).map(() => SOMETHING).orElse(NOTHING)).toEqual(NOTHING));

                test(`mBind: for ${value} should be skipped`, () =>
                    expect(maybeValue.mBind(thisShouldNotHappen).orNull()).toEqual(null));

                test(`or: for ${value} is ${maybeValue.inspect()}`, () => {
                    expect(maybeValue.or(() => some(otherValue)).orNull()).toEqual(otherValue);
                    expect(maybeValue.mBind(() => nothing()).orNull()).toEqual(null);
                });
            });

            test(`toResult: for ${value} is ${maybeValue.inspect()} should be a Failure`, () =>
                expect(maybeValue.toResult().isSuccess).toEqual(false));
        });
    });

    describe('custom none type discriminator', () => {
        it('should be nothing for a false value', () =>
            expect(maybe(SOMETHING, false)
                .map(thisShouldNotHappen).orElse(NOTHING)).toEqual(NOTHING));

        it('should be something for a false value', () =>
            expect(maybe(SOMETHING, true)
                .map(value => value + SOMETHING ).orElse(NOTHING)).toEqual(SOMETHING + SOMETHING));
    });
});