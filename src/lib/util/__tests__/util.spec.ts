import {empty, has, matchOn, notEmpty, typeOf} from '../index';
import {faker} from '@faker-js/faker';

describe('util', () => {
  const toBe = (expectation: boolean) => <T>(value: T) => ({value, expectation});

  describe('empty', () => {
    const emptyValues = [
      NaN,
      null,
      undefined,
      '',
      ``, // eslint-disable-line
      '', // eslint-disable-line
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
      ['', ``, '', ''], // eslint-disable-line
      [{}, {}, {}],
      [[], [], []],
      [[''], ``, '', '', {}], // eslint-disable-line
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
      new Date(),
      new Boolean(),
      new Number(),
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
      '', // eslint-disable-line
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
      ['', ``, '', ''], // eslint-disable-line
      [{}, {}, {}],
      [[], [], []],
      [[''], ``, '', '', {}], // eslint-disable-line
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

    [...emptyValues, ...notEmptyValues].forEach(({value, expectation}) => {
      test(`has(${String(value)}) of ${typeOf(value)} is ${expectation}`,
        () => expect(has(value)).toEqual(expectation));

      test(`notEmpty(${String(value)}) of ${typeOf(value)} is ${expectation}`,
        () => expect(notEmpty(value)).toEqual(expectation));
    });
  });

  describe('pattern matching', () => {
    const matchValue = matchOn([1, 2, 3]);

    test('should match on pattern', () => {
      expect(matchValue(1, {
        [1]: () => 23,
        [2]: () => Number.MIN_SAFE_INTEGER,
        [3]: () => Number.MAX_SAFE_INTEGER,
      }).orElse(4)).toEqual(23);

      // if you add to the enum it will cause a linting error below
      // make sure the choices are exhaustive
      enum FOO {
        BAR = 'BAR',
        BAZ = 'BAZ',
        BOP = 'BOP'
      }

      expect(matchOn(Object.values(FOO))(FOO.BOP, {
        [FOO.BAR]: () => 3,
        [FOO.BOP]: () => 4,
        [FOO.BAZ]: () => 5
      }).orElse(6)).toEqual(4);

      expect(matchValue(1, {
        [1]: () => 23,
        [2]: () => Number.MIN_SAFE_INTEGER,
        [3]: () => Number.MAX_SAFE_INTEGER,
      }).orElse(4)).toEqual(23);
    });

    test('default value', () => {
      expect(matchValue(10 as 2, {
        [1]: () => ({a: 23}),
        [2]: () => ({a: Number.MIN_SAFE_INTEGER}),
        [3]: () => ({a: Number.MAX_SAFE_INTEGER}),
      }).orElse({a: 4}).a).toEqual(4);

      expect(matchValue(undefined, {
        [1]: () => ({a: 23}),
        [2]: () => ({a: Number.MIN_SAFE_INTEGER}),
        [3]: () => ({a: Number.MAX_SAFE_INTEGER}),
      }).orElse({a: 4}).a).toEqual(4);
    });
  });
});
