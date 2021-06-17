import {expect} from 'chai';
import {empty, has, typeOf} from '../index';
import * as faker from 'faker';

const test = it;

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
            new String(),
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
            new Boolean(),
            new Number(),
            new String('sdf'),
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
                () => expect(empty(value)).to.eql(expectation)));
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
            new String(),
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
            new Boolean(),
            new Number(),
            new String('sdf'),
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
                () => expect(has(value)).to.eql(expectation)));
    });
});