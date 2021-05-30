import {expect} from 'chai';
import {maybe} from '../maybe';

const test = it;

const SOME = 'SOME';
const NONE = 'NONE';

const lambda = () => NONE;
const functionExpression = function () {
    return NONE;
};

function functionDeclaration() {
    return NONE;
}

const setup = (expectation: 'SOME' | 'NONE') => <T>(value: T) => ({value, expectation});
const nones = [
    NaN,
    null,
    undefined
].map(setup(NONE));
const somes = [
    {},
    false,
    true,
    lambda,
    functionExpression,
    functionDeclaration,
    0,
    -0,
    5,
    -34,
    0n,
    -0n,
    46n,
    -346n,
    Symbol(),
    SOME,
    "", // eslint-disable-line
    '',
    ``  // eslint-disable-line
].map(setup(SOME));

describe('Maybe', () => [...nones, ...somes].forEach(({value, expectation}) => {
    const maybeValue = maybe(value);
    test(`${maybeValue.inspect()} ${maybeValue.isNone ? `of value: ${value}` : ''}`, () =>
        expect(maybeValue.map(() => SOME).orElse(NONE)).to.equal(expectation));
}));