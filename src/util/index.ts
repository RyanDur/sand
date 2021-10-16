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

export const inspect = (value: unknown): string => (value as Inspectable).inspect?.() || String(value);

export const matches = <MATCH extends string | number, MATCH_ON extends string | number>(values: MATCH[]): (value: MATCH_ON) => MATCH => {
    const obj = values.reduce((acc, value) => ({...acc, [value]: value}), ({} as Record<string | number, MATCH>));
    return (value: MATCH_ON) => obj[value];
};

export const matchOn = <MATCH extends string | number, MATCH_ON>(matcher: (value: MATCH_ON) => MATCH) => <VALUE>(
    on: MATCH_ON,
    cases: Record<MATCH, () => VALUE>
): Maybe<VALUE> => maybe.of(cases[matcher(on)]).map(value => value());

export const typeOf = (value: unknown): string => {
    if (Number.isNaN(value)) return 'nan';
    if (value === null) return 'null';
    return typeof value;
};

export const not = (value: unknown): boolean => !value;

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
            const record = value as Record<string | symbol | number, unknown>;
            if (record.isEmpty) return (record as unknown as IsEmpty).isEmpty();
            return Object.keys(record).reduce((acc: boolean, key) => acc && empty(record[key]), true);
        }
        default:
            return false;
    }
};

export const has = (value: unknown): boolean => not(empty(value));
