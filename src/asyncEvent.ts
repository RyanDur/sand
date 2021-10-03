import {OnAsyncEvent, Result} from './types';
import {shallowFreeze} from './util';
import {Consumer} from './function/types';

export const asyncEvent = <T, E>(result: Result.Async<T, E>): OnAsyncEvent<T, E> => shallowFreeze({
    onLoading: (loading: Consumer<void>) => loading(),
    onLoad: (loaded: Consumer<T>) => void result.onSuccess(loaded),
    onError: (err: Consumer<E>) => void result.onFailure(err)
});