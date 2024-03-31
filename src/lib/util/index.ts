import {Inspectable, IsEmpty} from './types';
import {Maybe} from '../types';
import {maybe} from '../maybe';

const nameOfBuiltInInstanceOf = (value: unknown): string | undefined => {
  if (value instanceof Boolean) return 'Boolean';
  if (value instanceof String) return 'String';
  if (value instanceof Number) return 'Number';
  if (value instanceof Date) return 'Date';
  if (value instanceof Map) return 'Map';
  if (value instanceof Set) return 'Set';
  if (Array.isArray(value)) return 'Array';
  return undefined;
};

export const shallowFreeze = <T>(obj: T): T => Object.freeze(obj);

const toJson = (data: unknown) => JSON.stringify(data, (_, v) => typeof v === 'bigint' ? `${v}n` : v)?.replace(/"(-?\d+)n"/g, (_, a) => a);
export const inspect = (value: unknown): string => has(value) && (value as Inspectable).inspect?.() || toJson(value);

/**
 *
 * @see [test for matchOn](https://github.com/RyanDur/sand/blob/main/src/lib/util/__tests__/util.spec.ts#L123)
 *
 * Example:
 *
 * ```typescript
 * enum Thing {
 *    One = 'One',
 *    Two = 'Two',
 *    Three = 'Three'
 * }
 *
 * const matchThings = matchOn(Object.values(Thing));
 *
 * matchThings(Thing.Two, {
 *    [Thing.One]: () => 'I am one',
 *    [Thing.Two]: () => 'I am two',
 *    [Thing.Three]: () => 'I am three',
 * }).orElse('none of the above'); // produces: "I am two"
 *
 * matchThings(undefined, {
 *    [Thing.One]: () => 'I am one',
 *    [Thing.Two]: () => 'I am two',
 *    [Thing.Three]: () => 'I am three',
 * }).orElse('none of the above'); // produces: "none of the above"
 * ```
 *
 * */
export const matchOn = <MATCH extends string | number>(
  matches: MATCH[]
): <VALUE>(on: (MATCH | null | undefined), cases: Record<MATCH, () => VALUE>) => Maybe<VALUE> => {
  const obj = matches.reduce((acc, value) => ({...acc, [value]: value}), ({} as Record<MATCH, MATCH>));
  const matcher = (value: MATCH) => obj[value];
  return <VALUE>(
    on: MATCH | null | undefined = null,
    cases: Record<MATCH, () => VALUE>
  ): Maybe<VALUE> => maybe(cases[matcher(on as MATCH)]).map(value => value());
};

export const typeOf = (value: unknown): string => {
  if (Number.isNaN(value)) return 'nan';
  if (value === null) return 'null';
  return typeof value;
};

/**
 * Will negate any boolean or truthy or falsy value.
 *
 * Example:
 *
 * ```ts
 * not(true) // produces: false
 * not(false) // produces: true
 * ```
 * */
export const not = (value: unknown): boolean => !value;

/**
 * Will translate any boolean or truthy or falsy value.
 *
 * Example:
 *
 * ```ts
 * is(true) // produces: true
 * is(false) // produces: false
 * ```
 * */
export const is = (value: unknown): boolean => !not(value);

/**
 * tests whether a value is empty
 *
 * @see [test for empty](https://github.com/RyanDur/sand/blob/main/src/lib/util/__tests__/util.spec.ts#L7)
 *
 * Example:
 *
 * ```javascript
 * empty({}) // produces: true
 * empty({I: 'am not empty'}) // produces: false
 *
 * empty([]) // produces: true
 * empty([1, 2, 3]) // produces: false
 *
 * empty('') // produces: true
 * empty('not empty') // produces: false
 *
 * empty(NaN) // produces: true
 * empty(0) // produces: false
 * ```
 *
 * */
export const empty = (value: unknown): boolean => {
  switch (nameOfBuiltInInstanceOf(value) || typeOf(value)) {
    case 'nan':
    case 'null':
    case 'undefined':
    case 'string':
      return not(value);
    case 'String':
    case 'Set':
      return empty(Array.from(value as Iterable<unknown>));
    case 'Map': {
      const map = value as Map<string, unknown>;
      return Array.from(map.values()).reduce((acc: boolean, key) => acc && empty(key), true);
    }
    case 'Array':
    case 'object': {
      const record = value as Record<string | number, unknown> & Partial<IsEmpty>;
      if (record.isEmpty) return record.isEmpty();
      return Object.keys(record).reduce((acc: boolean, key) => acc && empty(record[key]), true);
    }
    default:
      return false;
  }
};
/**
 * A value that is [not](https://github.com/RyanDur/sand/blob/main/src/lib/util/index.ts) [empty](https://github.com/RyanDur/sand/blob/main/src/lib/util/index.ts).
 *
 * @see [test for has](https://github.com/RyanDur/sand/blob/main/src/lib/util/__tests__/util.spec.ts#L65)
 *
 * Example:
 *
 * ```ts
 * notEmpty({}) // produces: false
 * notEmpty({I: 'am not empty'}) // produces: true
 *
 * notEmpty([]) // produces: false
 * notEmpty([1, 2, 3]) // produces: true
 *
 * notEmpty('') // produces: false
 * notEmpty('not empty') // produces: true
 *
 * notEmpty(NaN) // produces: false
 * notEmpty(0) // produces: true
 * ```
 *
 * */
export const notEmpty = <T>(value: T): value is T => not(empty(value));

/**
 * A value that is [not](https://github.com/RyanDur/sand/blob/main/src/lib/util/index.ts) [empty](https://github.com/RyanDur/sand/blob/main/src/lib/util/index.ts).
 *
 * @see [test for has](https://github.com/RyanDur/sand/blob/main/src/lib/util/__tests__/util.spec.ts#L65)
 *
 * Example:
 *
 * ```ts
 * has({}) // produces: false
 * has({I: 'am not empty'}) // produces: true
 *
 * has([]) // produces: false
 * has([1, 2, 3]) // produces: true
 *
 * has('') // produces: false
 * has('not empty') // produces: true
 *
 * has(NaN) // produces: false
 * has(0) // produces: true
 * ```
 *
 * */
export const has = notEmpty;
