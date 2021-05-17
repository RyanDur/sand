import {expect} from 'chai';
import {maybe} from '../maybe';
import * as faker from 'faker';

const test = it;

describe('maybe', () => {
    const word = faker.lorem.word();
    const otherWord = faker.lorem.word();

    test('of some', () => {
        const maybeWord = maybe.some(word);

        expect(maybeWord.map(thisWord => thisWord + otherWord).orElse(otherWord))
            .to.eql(word + otherWord);
    });

    test('of none', () => {
        const maybeWord = maybe.some();

        expect(maybeWord.map(() => expect.fail('this should not happen') as string)
            .orElse(otherWord)).to.eql(otherWord);
    });
});