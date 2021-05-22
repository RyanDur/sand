import {expect} from 'chai';
import {maybe} from '../maybe';

const test = it;
const SOMETHING = 'SOMETHING';
const NOTHING = 'NOTHING';

describe('Maybe', () => {
    [
        {value: {}, expectation: SOMETHING},
        {value: null, expectation: NOTHING},
        {value: undefined, expectation: NOTHING},
        {value: false, expectation: SOMETHING},
        {value: true, expectation: SOMETHING},
        {value: () => SOMETHING, expectation: SOMETHING},
        {value: function() {return SOMETHING;}, expectation: SOMETHING},
        {value: 5, expectation: SOMETHING},
        {value: 0, expectation: SOMETHING},
        {value: -0, expectation: SOMETHING},
        {value: NaN, expectation: NOTHING},
        {value: SOMETHING, expectation: SOMETHING},
        {value: "", expectation: SOMETHING},  // eslint-disable-line
        {value: '', expectation: SOMETHING}, // eslint-disable-line
        {value: ``, expectation: SOMETHING}  // eslint-disable-line
    ].forEach(({value, expectation}) => {
        test(`maybe(${value})`, () => expect(maybe(value).map(() => SOMETHING).orElse(NOTHING))
            .to.equal(expectation));
    });
});
