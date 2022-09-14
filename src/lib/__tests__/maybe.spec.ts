import {maybe, nothing, some} from '../maybe';
import * as faker from 'faker';
import {Maybe} from '../types';

describe('the Maybe', () => {
    const SOMETHING = 'SOMETHING';
    const NOTHING = undefined;
    const thisShouldNotHappen = () => fail('this should not happen');
    const otherValue = faker.lorem.sentence();

    const testSomething = <T>(maybeValue: Maybe<T>, expected: T) => {
        describe('something', () => {
            describe('why it is a monad', () => {
                test.skip('orElse: for SOMETHING should not provide the fallback value', () =>
                    expect(maybeValue.orElse(otherValue)).toBe(expected));

                test.skip(`map: for SOMETHING is ${maybeValue.inspect?.()} `, () =>
                    expect(maybeValue.map(inner => `${inner} ${SOMETHING}`).orElse(otherValue))
                        .toEqual(`${expected} ${SOMETHING}`));

                describe('mBind: for SOMETHING ', () => {
                    test.skip('should allow us to migrate to a different something', () =>
                        expect(maybeValue.mBind(inner => some(`${inner}, ${otherValue}`)).orNull())
                            .toEqual(`${expected}, ${otherValue}`));

                    test.skip('should allow us to bind to nothing', () =>
                        expect(maybeValue.mBind(() => nothing()).orNull()).toEqual(null));
                });

                test.skip('or: for SOMETHING should be skipped', () =>
                    expect(maybeValue.or(thisShouldNotHappen).orElse(otherValue)).toBe(expected));
            });

            test.skip(`toResult: for SOMETHING is ${maybeValue.inspect?.()} should be a Success`, () =>
                expect(maybeValue.toResult?.().isSuccess).toEqual(true));
        });
    };

    testSomething(some(SOMETHING), SOMETHING);

    const testNothing = <T>(maybeValue: Maybe<T>) => {
        describe('nothing', () => {
            describe('why it is a monad', () => {
                test.skip('orElse: for undefined should provide the fallback value', () =>
                    expect(maybeValue.orElse(NOTHING)).toEqual(NOTHING));

                test.skip('map: for undefined should be skipped', () =>
                    expect(maybeValue.map(thisShouldNotHappen).orElse(NOTHING)).toEqual(NOTHING));

                test.skip('mBind: for undefined should be skipped', () =>
                    expect(maybeValue.mBind(thisShouldNotHappen).orNull()).toEqual(null));

                describe('or: for undefined', () => {
                    test.skip('should allow us to migrate to a something', () =>
                        expect(maybeValue.or(() => some(otherValue)).orNull()).toEqual(otherValue));

                    test.skip('should allow us to migrate to a different nothing', () =>
                        expect(maybeValue.mBind(() => nothing()).orNull()).toEqual(null));
                });
            });

            test.skip(`toResult: for undefined is ${maybeValue.inspect?.()} should be a Failure`, () =>
                expect(maybeValue.toResult?.().isSuccess).toEqual(false));
        });
    };

    testNothing(nothing());

    describe.skip('with custom isSomething definition', () => {
        testSomething(maybe(NOTHING, true), NOTHING);
        testNothing(maybe(SOMETHING, false));
    });

    describe('with default isSomething definition', () => {
        describe.skip('what is nothing', () => {
            [
                NaN,
                null,
                undefined
            ].forEach(value => testNothing(maybe(value)));
        });

        describe.skip('what is something', () => {
            const lambda = () => NOTHING;
            const functionExpression = function () {
                return NOTHING;
            };

            function functionDeclaration() {
                return NOTHING;
            }

            [
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
            ].forEach(value => testSomething(maybe(value), value));
        });
    });
});
