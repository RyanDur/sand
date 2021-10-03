import {asyncResult} from '../asyncResult';
import {asyncEvent} from '../asyncEvent';
import * as faker from 'faker';

describe('an async event', () => {
    const expected = faker.lorem.words();

    test('loading', done => {
        const loading = jest.fn();
        asyncEvent(asyncResult.success(expected)).onLoading(() => {
            loading();
            return done();
        });
        expect(loading).toHaveBeenCalled();
    });

    test('loaded', done =>
        asyncEvent(asyncResult.success(expected)).onLoad(data => {
            expect(data).toEqual(expected);
            return done();
        }));

    test('error', (done) =>
        asyncEvent(asyncResult.failure(expected)).onError(err => {
            expect(err).toEqual(expected);
            return done();
        }));
});