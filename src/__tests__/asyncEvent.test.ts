import {asyncResult} from '../asyncResult';
import {asyncEvent} from '../asyncEvent';
import * as faker from 'faker';

describe('an async event', () => {
    const expected = faker.lorem.words();

    describe('loading', () => {
        it('identify when it is loading', done => {
            const loading = jest.fn();
            asyncEvent(asyncResult.success(expected))
                .onLoading(loading);

            expect(loading).toHaveBeenNthCalledWith(1, true);
            setTimeout(() => {
                expect(loading).toHaveBeenNthCalledWith(2, false);
                done();
            }, 0);
        });
    });

    test('load', done =>
        void asyncEvent(asyncResult.success(expected)).onLoad(data => {
            expect(data).toEqual(expected);
            done();
        }));

    test('error', (done) =>
        void asyncEvent(asyncResult.failure(expected)).onError(err => {
            expect(err).toEqual(expected);
            done();
        }));
});