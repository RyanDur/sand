import {empty, has, matches, matchOn, typeOf} from '../index';
import * as faker from 'faker';
import {MatchOn} from '../types';

describe('util', () => {
    const toBe = (expectation: boolean) => <T>(value: T) => ({value, expectation});

    describe('empty', () => {
        const emptyValues = [
            NaN,
            null,
            undefined,
            '',
            ``, // eslint-disable-line
            "", // eslint-disable-line
            [],
            {},
            {
                isEmpty: () => true,
                evenThough: 'It Contains things'
            },
            new Set(),
            (new Map()).set(1, undefined),
            String(),
            [NaN, null, undefined],
            ['', ``, '', ""], // eslint-disable-line
            [{}, {}, {}],
            [[], [], []],
            [[''], ``, '', "", {}], // eslint-disable-line
            [[], {}, [[{}]], [], {}, {}],
            {k: [], v: {k: [], v: {}, t: ''}, t: ''},
            [
                {k: [], v: {k: [], v: {}, t: '', r: null}, t: ''},
                {k: [], q: NaN, v: {k: [], v: {x: undefined}, t: ''}, t: ''}
            ]
        ].map(toBe(true));
        const notEmptyValues = [
            () => void 0,
            {[faker.lorem.word()]: () => 0},
            {[faker.lorem.word()]: faker.lorem.sentence()},
            [faker.lorem.sentence()],
            (new Set()).add('adf'),
            (new Map()).set(faker.lorem.word(), faker.lorem.sentence()),
            0,
            0n,
            new Date(),
            Boolean(),
            Number(),
            String('sdf'),
            {isEmpty: () => false},
            Math.E,
            faker.lorem.word,
            true,
            false,
            Symbol(),
            [
                {k: [], v: {k: [], v: {}, t: '', r: null}, t: ''},
                {k: [], q: NaN, v: {k: [[{}, ['NOT _EMPTY']]], v: {x: undefined}, t: ''}, t: ''}
            ]
        ].map(toBe(false));
        [...emptyValues, ...notEmptyValues].forEach(({value, expectation}) =>
            test(`empty(${String(value)}) of ${typeOf(value)} is ${expectation}`,
                () => expect(empty(value)).toEqual(expectation)));
    });

    describe('has', () => {
        const emptyValues = [
            NaN,
            null,
            undefined,
            '',
            ``, // eslint-disable-line
            "", // eslint-disable-line
            [],
            {},
            {
                isEmpty: () => true,
                evenThough: 'It Contains things'
            },
            new Set(),
            (new Map()).set(1, undefined),
            String(),
            [NaN, null, undefined],
            ['', ``, '', ""], // eslint-disable-line
            [{}, {}, {}],
            [[], [], []],
            [[''], ``, '', "", {}], // eslint-disable-line
            [[], {}, [[{}]], [], {}, {}],
            {k: [], v: {k: [], v: {}, t: ''}, t: ''},
            [
                {k: [], v: {k: [], v: {}, t: '', r: null}, t: ''},
                {k: [], q: NaN, v: {k: [], v: {x: undefined}, t: ''}, t: ''}
            ]
        ].map(toBe(false));
        const notEmptyValues = [
            () => void 0,
            {[faker.lorem.word()]: () => 0},
            {[faker.lorem.word()]: faker.lorem.sentence()},
            [faker.lorem.sentence()],
            (new Set()).add('adf'),
            (new Map()).set(faker.lorem.word(), faker.lorem.sentence()),
            0,
            0n,
            new Date(),
            Boolean(),
            Number(),
            String('sdf'),
            {isEmpty: () => false},
            Math.E,
            faker.lorem.word,
            true,
            false,
            Symbol(),
            [
                {k: [], v: {k: [], v: {}, t: '', r: null}, t: ''},
                {k: [], q: NaN, v: {k: [[{}, ['NOT _EMPTY']]], v: {x: undefined}, t: ''}, t: ''}
            ]
        ].map(toBe(true));
        [...emptyValues, ...notEmptyValues].forEach(({value, expectation}) =>
            test(`has(${String(value)}) of ${typeOf(value)} is ${expectation}`,
                () => expect(has(value)).toEqual(expectation)));
    });

    describe('pattern matching', () => {
        const matcher = matches([1, 2, 3]);
        const matchValue = matchOn(matcher);

        const one = jest.fn();
        const two = jest.fn();
        const three = jest.fn();
        const four = jest.fn();

        afterEach(() => jest.resetAllMocks());

        test('should match on pattern', () => {
            matchValue(1, {
                [1]: one,
                [2]: two,
                [3]: three,
                [MatchOn.DEFAULT]: four
            });

            expect(one).toHaveBeenCalled();
            expect(two).not.toHaveBeenCalled();
            expect(three).not.toHaveBeenCalled();
            expect(four).not.toHaveBeenCalled();
        });

        test('default value', () => {
            matchValue(10 as 1, {
                [1]: one,
                [2]: two,
                [3]: three,
                [MatchOn.DEFAULT]: four
            });

            expect(one).not.toHaveBeenCalled();
            expect(two).not.toHaveBeenCalled();
            expect(three).not.toHaveBeenCalled();
            expect(four).toHaveBeenCalled();
        });
    });
});