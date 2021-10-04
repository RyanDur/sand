import {OnAsyncEvent, Result} from './types';
import {shallowFreeze} from './util';
import {Consumer} from './function/types';

export const asyncEvent = <T, E>(result: Result.Async<T, E>): OnAsyncEvent<T, E> => shallowFreeze({
    onLoading: (handleLoading: Consumer<void>) => {
        handleLoading();
        return asyncEvent(result);
    },
    onLoad: (handleLoad: Consumer<T>) => asyncEvent(result.onSuccess(handleLoad)),
    onError: (handleError: Consumer<E>) => asyncEvent(result.onFailure(handleError))
});