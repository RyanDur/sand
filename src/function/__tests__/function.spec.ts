import {has} from '../../util';
import {expect} from 'chai';
import {filter, head, tail} from '../index';

const test = it;

describe('functions', () => {
    interface Car {
        horsepower: number;
        dollar_value: number;
        name: string;
        in_stock: boolean
    }

    const car = {
        name: 'Aston Martin One-77',
        horsepower: 750,
        dollar_value: 1850000,
        in_stock: false,
    };
    const car2 = {
        name: 'John Martin Two-78',
        horsepower: 750,
        dollar_value: 1850000,
        in_stock: false,
    };
    const car3 = {
        name: 'Aston Craige Three-79',
        horsepower: 750,
        dollar_value: 1850000,
        in_stock: true,
    };
    const last = <T>([head, ...tail]: T[]): T => {
        if (has(tail)) return last(tail);
        return head;
    };

    const prop = (property: keyof Car) => (car: Car) => {
        return car[property];
    };

    const add = (a: number, b: number): number => a + b;

    const cars: Car[] = [car, car2, car3];

    // TODO Fix compose
    // test('isLastInStock', () => {
    //     const isLastInStock = compose(prop('in_stock'), last);
    //
    //     expect(isLastInStock(cars)).to.eql(true);
    // });
    //
    // test('average', () => {
    //     const sum = reduce(add, 0);
    //     const average = (xs: number[]) => sum(xs) / xs.length;
    //
    //     const averageDollarValue = pipe(map((car: Car) => car.dollar_value), average);
    //     expect(averageDollarValue(cars)).to.eql(1850000);
    // });

    // test('map composition law', () => {
    //     const value = '3';
    //     const f = (v: string) => 4 + v;
    //     const g = (v: string) => 1 + v;
    //     const p = (value: string) => value.includes('3');
    //
    //     expect(compose(map(f), map(g))(value)).to.deep.equal(map(compose(f, g))([value]));
    //     expect(compose(f, head)(value)).to.eql(compose(head, map(f))(value));
    //     expect(compose(map(f), filter(compose(p, f)))(value)).to.eql(compose(filter(p), map(f))(value));
    // });

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