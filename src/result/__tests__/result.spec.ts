import {err, explanation, ok} from '../index';
import {expect} from 'chai';
import * as faker from 'faker';
import {Explanation, Result} from "../types";

const join = (...es: Array<string>) => es.join(' ');

describe('Result', () => {
    const initial = faker.lorem.sentence();
    const sentence = faker.lorem.sentence();

    describe('an Ok result', () => {
        const okResult = ok(initial);

        it('should be ok', () => expect(okResult.isOk).to.be.true);
        it('should have an identity', () => expect(okResult.data()).is.equal(initial));
        it('should be mappable', () => okResult
            .map((response) => err(explanation(join(response, sentence))))
            .map((exp => expect(exp.reason).to.equal(join(initial, sentence)))));

        it('should be flat mappable into another result', () => okResult
            .flatmap((result) => result.isOk ? err(explanation(result.data())) : result)
            .flatmap((result: Result<string, Explanation<string>>) => {
                if (!result.isOk) expect(result.explanation()).to.eqls(explanation(initial));
                return result
            }));
    });

    describe('an Err result', () => {
        const reason = explanation(initial);
        const errResult = err(reason);

        it('should not be ok', () => expect(errResult.isOk).not.to.be.true);
        it('should have an identity', () => expect(errResult.explanation()).is.equal(reason));
        it('should be mappable', () => errResult
            .map((reason) => ok(join(reason.reason, sentence)))
            .map((result) => expect(result).to.equal(join(initial, sentence))));

        it('should be flat mappable into another result', () => errResult
            .flatmap((result) => !result.isOk ? ok(result.explanation().reason) : result)
            .flatmap((result: Result<string, Explanation<string>>) => {
                if (result.isOk) expect(result.data()).to.eqls(initial);
                else expect.fail('is not ok')
                return result;
            }));
    });
});