import {maybe, nothing, some} from '../maybe';
import {lawsOf} from './laws';
import {Maybe} from '../types';
import {faker} from '@faker-js/faker';

describe('the Maybe', () => {
    const SOMETHING = 'SOMETHING';
    const NOTHING = undefined;
    const thisShouldNotHappen = () => expect.fail('this should not happen');
    const otherValue = faker.lorem.sentence();

    const testSomething = <T>(maybeValue: Maybe<T>, expected: T, other: T) => {
        describe('something', () => {
            describe('why it is a monad', () => {
                test('orElse: for SOMETHING should not provide the fallback value', () =>
                    expect(maybeValue.orElse(other)).toBe(expected));

                test(`map: for SOMETHING is ${maybeValue.inspect?.()} `, () =>
                    expect(maybeValue.map(inner => `${inner} ${SOMETHING}`).orElse(otherValue))
                        .toEqual(`${expected} ${SOMETHING}`));

                describe('mBind: for SOMETHING ', () => {
                    test('should allow us to migrate to a different something', () =>
                        expect(maybeValue.mBind(inner => some(`${inner}, ${otherValue}`)).orNull())
                            .toEqual(`${expected}, ${otherValue}`));

                    test('should allow us to bind to nothing', () =>
                        expect(maybeValue.mBind(() => nothing()).orNull()).toEqual(null));
                });

                test('or: for SOMETHING should be skipped', () =>
                    expect(maybeValue.or(thisShouldNotHappen).orElse(other)).toBe(expected));
            });

            test(`toResult: for SOMETHING is ${maybeValue.inspect?.()} should be a Success`, () =>
                expect(maybeValue.toResult?.('fallback').isSuccess).toEqual(true));
        });
    };

    testSomething(some(SOMETHING), SOMETHING, otherValue);

    const testNothing = <T>(maybeValue: Maybe<T>, fallback: T) => {
        describe('nothing', () => {
            describe('why it is a monad', () => {
                test('orElse: for undefined should provide the fallback value', () =>
                    expect(maybeValue.orElse(fallback)).toEqual(fallback));

                test('map: for undefined should be skipped', () =>
                    expect(maybeValue.map<T>(thisShouldNotHappen).orElse(fallback)).toEqual(fallback));

                test('mBind: for undefined should be skipped', () =>
                    expect(maybeValue.mBind(thisShouldNotHappen).orNull()).toEqual(null));

                describe('or: for undefined', () => {
                    test('should allow us to migrate to a something', () =>
                        expect(maybeValue.or(() => some(fallback)).orNull()).toEqual(fallback));

                    test('should allow us to migrate to a different nothing', () =>
                        expect(maybeValue.mBind(() => nothing()).orNull()).toEqual(null));
                });
            });

            test(`toResult: for undefined is ${maybeValue.inspect?.()} should be a Failure`, () =>
                expect(maybeValue.toResult?.('fallback').isSuccess).toEqual(false));
        });
    };

    testNothing(nothing(), NOTHING);

    describe('with custom isSomething definition', () => {
        testSomething(maybe(NOTHING, () => true), NOTHING, NOTHING);
        testNothing(maybe(SOMETHING, () => false), otherValue);
    });

    describe('and - combine all values into an array passed to the functions', () => {
        it('should work for same types', () => {
            expect(maybe(3).and(maybe(4)).map(([a, b]) => a + b).orElse(0)).toEqual(7);
        });
        it('should work for mixed types', () => {
            expect(maybe(3).and(maybe('4')).map(([a, b]) => a + b).orElse('')).toEqual('34');
        });

        it('should handle chaining', () => {
            expect(maybe(3).and(maybe(4).and(maybe(13)))
                .map(([a, [b, c]]) => a + b + c).orElse(0)).toEqual(20);

            expect(maybe(3).and(maybe(4)).and(maybe(13))
                .map(([[a, b], c]) => a + b + c).orElse(0)).toEqual(20);

            expect(maybe(3).and(maybe(4)).and(maybe(13)).and(maybe(10))
                .map(([[[a, b], c], d]) => a + b + c + d).orElse(0)).toEqual(30);

            expect(maybe(3).and(maybe(4)).and(maybe(13).and(maybe(10)))
                .map(([a, b]) =>
                    a.reduce((acc, num) => acc + num, 0) +
                    b.reduce((acc, num) => acc + num, 0)).orElse(0)
            ).toEqual(30);
        });

        it('should handle "nothing"', () => {
            expect(maybe(3).and(nothing()).isNothing).toBe(true);
            expect(nothing().and(maybe(3)).isNothing).toBe(true);
        });
    });

    describe('with default isSomething definition', () => {
        describe('what is nothing', () => {
            [
                NaN,
                null,
                undefined
            ].forEach(value => testNothing(maybe(value), 0));
        });

        describe('what is something', () => {
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
                SOMETHING,
                "", // eslint-disable-line
                '',
                ``  // eslint-disable-line
            ].forEach(value => testSomething(maybe(value), value, otherValue));
        });
    });
});

describe('either folds the two branches of a Maybe into one value', () => {
    test('some folds through the first branch', () => {
        expect(some(3).either(value => `got ${value}`, () => 'empty')).toEqual('got 3');
    });

    test('nothing folds through the second branch', () => {
        expect(nothing().either(value => `got ${value}`, () => 'empty')).toEqual('empty');
    });

    test('the branches keep their own types', () => {
        const folded: number = some('abc').either(value => value.length, () => 0);
        expect(folded).toEqual(3);
    });
});

describe('Maybe is a lawful Functor, Monad, and Catamorphism', () => {
    const eq = (left: Maybe<number>, right: Maybe<number>): void =>
        expect(left.inspect()).toEqual(right.inspect());
    const laws = lawsOf<Maybe<number>, void>(some, eq);
    const hit = (value: number): string => `hit ${value}`;
    const miss = (): string => 'miss';

    test('monad left identity: some(a).mBind(f) is f(a)', laws.leftIdentity);
    test('monad right identity holds on both branches', () => {
        laws.rightIdentity(some(3));
        laws.rightIdentity(nothing());
    });
    test('monad associativity holds on both branches', () => {
        laws.associativity(some(3));
        laws.associativity(nothing());
    });
    test('the maybe factory is unit too: maybe(a).mBind(f) is f(a)', () =>
        expect(maybe(3).mBind(value => some(value * 2)).inspect()).toEqual(some(6).inspect()));
    test('functor identity holds on both branches', () => {
        laws.mapIdentity(some(3));
        laws.mapIdentity(nothing());
    });
    test('functor composition holds on both branches', () => {
        laws.mapComposition(some(3));
        laws.mapComposition(nothing());
    });
    test('catamorphism computation: folding a constructor selects its branch', () => {
        expect(some(3).either(hit, miss)).toEqual('hit 3');
        expect(nothing().either(hit, miss)).toEqual('miss');
    });
    test('catamorphism reflection: folding with the constructors rebuilds the value', () => {
        const reflect = (m: Maybe<number>): void =>
            expect(m.either(some, nothing).inspect()).toEqual(m.inspect());
        reflect(some(3));
        reflect(nothing());
    });
    test('catamorphism fusion: a function after the fold distributes into both branches', () => {
        const shout = (folded: string): string => folded.toUpperCase();
        const fused = (m: Maybe<number>): void =>
            expect(shout(m.either(hit, miss))).toEqual(m.either(value => shout(hit(value)), () => shout(miss())));
        fused(some(3));
        fused(nothing());
    });
});
