import {err, explanation, ok} from '../index';
import {expect} from 'chai';
import * as faker from 'faker';
import {Result} from "../types";

const join = (...es: Array<string>) => es.join(' ');

describe('Result', () => {
    const initial = faker.lorem.sentence();
    const sentence = faker.lorem.sentence();
    describe('an Ok result', () => {
        const okResult = ok(initial);

        it('should be ok', () => expect(okResult.isOk).to.be.true);
        it('should be mappable', () => okResult
            .map((response) => ok(join(response, sentence)))
            .map((response) => expect(response).to.equal(join(initial, sentence))));

        it('should be mappable', () => okResult
            .map((response) => err(explanation(join(response, sentence)))
                .map(({reason}) => expect(reason).to.equal(join(initial, sentence)))));

        it('should be flat mappable into another result', () => {
            let actual = okResult.flatmap(({data}) => err(explanation(data())));
            if (!actual.isOk) {
                expect(actual.reason()).to.eqls(explanation(initial));
            } else expect.fail('is ok');
        });
    });

    describe('an Err result', () => {
        const reason = explanation(initial);
        const errResult = err(reason);

        it('should not be ok', () => expect(errResult.isOk).not.to.be.true);

        it('should have an identity', () => expect(errResult.reason()).is.equal(reason));

        it('should be mappable', () => errResult
            .map(({reason}) => err(explanation(join(reason, sentence)))
                .map(({reason}) => expect(reason).to.equal(join(initial, sentence)))));

        it('should be flat mappable into another result', () => {
            let actual = errResult.flatmap((error) => ok(error.reason()));
            if (actual.isOk) {
                expect(actual.data()).to.eqls(reason);
            } else expect.fail('is not ok');
        });
    });
});