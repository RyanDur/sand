import {OnAsyncEvent, Result} from './types';
import {shallowFreeze} from './util';
import {Consumer} from './function/types';

export const asyncEvent = <T, E>(result: Result.Async<T, E>): OnAsyncEvent<T, E> => shallowFreeze({
    onLoading: (loading: Consumer<void>) => {
        loading();
        return asyncEvent(result);
    },
    onLoad: (loaded: Consumer<T>) => asyncEvent(result.onSuccess(loaded)),
    onError: (err: Consumer<E>) => asyncEvent(result.onFailure(err))
});