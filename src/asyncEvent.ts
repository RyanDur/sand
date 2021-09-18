import {Result} from './types';
import {AsyncEvent, AsyncState, Loaded, Loading, Error, OnAsyncEvent} from './types';

export const loading = (): Loading => ({type: AsyncState.LOADING});
export const loaded = <T>(data: T): Loaded<T> => ({type: AsyncState.LOADED, data});
export const error = <E>(reason?: E): Error<E> => ({type: AsyncState.ERROR, reason});

export const asyncEvent = <T, E>(result: Result.Async<T, E>): OnAsyncEvent<T, E> => {
    return {
        onAsyncEvent: (dispatch: (event: AsyncEvent<T, E>) => void) => {
            dispatch(loading());
            result.onComplete(result => {
                if (result.isOk) dispatch(loaded(result.data));
                else dispatch(error(result.explanation));
            });
        }
    };
};