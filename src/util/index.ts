import {Supplier} from '../function/types';
import {Inspectable} from '../types';

export const shallowFreeze = <T>(obj: T): T => Object.freeze(obj);

export const inspect = (inspectable: unknown): string => (inspectable as Inspectable).inspect?.() || String(inspectable);

export const typeOf = (value: unknown): string => {
    if (Number.isNaN(value)) return 'NaN';
    if (value === null) return 'null';
    return typeof value;
};

const builtInInstanceOf = (value: unknown): string | undefined => {
    if (value instanceof Boolean) return 'Boolean';
    if (value instanceof String) return 'String';
    if (value instanceof Number) return 'Number';
    if (value instanceof Date) return 'Date';
    if (value instanceof Map) return 'Map';
    if (value instanceof Set) return 'Set';
    if (Array.isArray(value)) return 'Array';
    return undefined;
};

export const not = (value: unknown): boolean => !value;

export const empty = (value: unknown): boolean => {
    switch (builtInInstanceOf(value) || typeOf(value)) {
        case 'NaN':
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
            if (record.isEmpty) return (record as { isEmpty: Supplier<boolean> }).isEmpty();
            return Object.keys(record).reduce((acc: boolean, key) => acc && empty(record[key]), true);
        }
        default:
            return false;
    }
};

export const has = (value: unknown): boolean => not(empty(value));