import {Consumer, Func} from '../function/types';

export interface OnAsyncEvent<T, E> {
    onLoading: Func<Consumer<void>, OnAsyncEvent<T, E>>;
    onLoad: Func<Consumer<T>, OnAsyncEvent<T, E>>;
    onError: Func<Consumer<E>, OnAsyncEvent<T, E>>;
}