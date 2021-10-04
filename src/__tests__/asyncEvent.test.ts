import {asyncResult} from '../asyncResult';
import {asyncEvent} from '../asyncEvent';
import * as faker from 'faker';

describe('an async event', () => {
    const expected = faker.lorem.words();

    test('loading', done => {
        const loading = jest.fn();
        asyncEvent(asyncResult.success(expected)).onLoading(() => {
            loading();
            done();
        });
        expect(loading).toHaveBeenCalled();
    });

    test('loaded', done =>
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