import {asyncResult} from '../asyncResult';
import {asyncEvent, error, loaded, loading} from '../asyncEvent';
import {AsyncEvent, AsyncState} from '../types';
import * as faker from 'faker';

describe('an async event', () => {
    const expected = faker.lorem.words();

    test('loading', (done) =>
        asyncEvent(asyncResult.success(expected))
            .on((event: AsyncEvent<string, unknown>) => {
                switch (event.type) {
                    case AsyncState.LOADING: {
                        expect(event).toEqual(loading());
                        return done();
                    }
                }
            }));

    test('success', (done) =>
        asyncEvent(asyncResult.success(expected))
            .on((event: AsyncEvent<string, unknown>) => {
                switch (event.type) {
                    case AsyncState.LOADING:
                        return expect(event).toEqual(loading());
                    case AsyncState.LOADED: {
                        expect(event).toEqual(loaded(expected));
                        return done();
                    }
                    default:
                        fail('this should not happen');
                }
            }));

    test('failure', (done) =>
        asyncEvent(asyncResult.failure(expected))
            .on((event: AsyncEvent<unknown, string>) => {
                switch (event.type) {
                    case AsyncState.LOADING:
                        return expect(event).toEqual(loading());
                    case AsyncState.ERROR: {
                        expect(event).toEqual(error(expected));
                        return done();
                    }
                    default:
                        fail('this should not happen');
                }
            }));
});