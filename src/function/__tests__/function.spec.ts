import {compose, filter, head, map, tail} from '../index';

describe('functions', () => {
    test('map composition law', () => {
        const value = ['3'];
        const f = (v: string) => 4 + v;
        const g = (v: string) => 1 + v;
        const p = (value: string) => value.includes('3');

        expect(compose(map(f), map(g))(value)).toEqual(map(compose(f, g))(value));
        expect(compose(f, head)(value)).toEqual(compose(head, map(f))(value));
        expect(compose(map(f), filter(compose(p, f)))(value)).toEqual(compose(filter(p), map(f))(value));
    });

    test('filter', () => {
        const listToFilter = ['I', 'am', 'to be', 'filtered'];
        expect(filter((val) => val === 'to be')(listToFilter)).toEqual(['to be']);
        expect(filter((val) => val === 'not to be')(listToFilter)).toEqual([]);
        expect(filter((val) => val === 'to be')()).toEqual([]);
    });

    test('head', () => {
        expect(head(['I', 'am', 'to be'])).toEqual('I');
        expect(head([])).toEqual(undefined);

        expect(head('some string')).toEqual('s');
        expect(head('')).toEqual(undefined);
    });

    test('tail', () => {
        expect(tail(['I', 'am', 'to be'])).toEqual(['am', 'to be']);
        expect(tail([])).toEqual([]);

        expect(tail('some string')).toEqual('ome string');
        expect(tail('')).toEqual('');
    });
});