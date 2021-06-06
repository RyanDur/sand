import {expect} from 'chai';
import {compose, filter, head, map, tail} from '../index';

const test = it;

describe('functions', () => {
    test('map composition law', () => {
        const value = ['3'];
        const f = (v: string) => 4 + v;
        const g = (v: string) => 1 + v;
        const p = (value: string) => value.includes('3');

        expect(compose(map(f), map(g))(value)).to.deep.equal(map(compose(f, g))(value));
        expect(compose(f, head)(value)).to.eql(compose(head, map(f))(value));
        expect(compose(map(f), filter(compose(p, f)))(value)).to.eql(compose(filter(p), map(f))(value));
    });

    test('filter', () => {
        const listToFilter = ['I', 'am', 'to be', 'filtered'];
        expect(filter((val) => val === 'to be')(listToFilter)).to.eql(['to be']);
        expect(filter((val) => val === 'not to be')(listToFilter)).to.eql([]);
        expect(filter((val) => val === 'to be')()).to.eql([]);
    });

    test('head', () => {
        expect(head(['I', 'am', 'to be'])).to.eql('I');
        expect(head([])).to.eql(undefined);

        expect(head('some string')).to.eql('s');
        expect(head('')).to.eql(undefined);
    });

    test('tail', () => {
        expect(tail(['I', 'am', 'to be'])).to.eql(['am', 'to be']);
        expect(tail([])).to.eql([]);

        expect(tail('some string')).to.eql('ome string');
        expect(tail('')).to.eql('');
    });
});