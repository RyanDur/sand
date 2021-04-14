import {err, explanation, ok} from '../index';
import {expect} from 'chai';
import * as faker from "faker";

const join = (...es: Array<string>) => es.join(' ');

describe('Result', () => {
    describe('an Ok result', () => {
        const initialResponse = faker.lorem.sentence();
        const okResult = ok(initialResponse);

        it('should be ok', () => expect(okResult.isOk).to.be.true);
        it('should be mappable', () => {
            const sentence = faker.lorem.sentence();
            okResult
                .map((response) => ok(join(response, sentence)))
                .map((response) => expect(response).to.equal(join(initialResponse, sentence)));
        });
    });

    describe('an Err result', () => {
        const initialReason = faker.lorem.sentence();
        const errResult = err(explanation(initialReason));

        it('should not be ok', () => expect(errResult.isOk).not.to.be.true);
        it('should be mappable', () => {
            const sentence = faker.lorem.sentence();
            errResult
                .map(({reason}) => err(explanation(join(reason, sentence)))
                .map(({reason}) => expect(reason).to.equal(join(initialReason, sentence))));
        });
    });
});