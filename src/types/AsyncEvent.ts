import {Consumer} from '../function/types';

export interface OnAsyncEvent<T, E> {
    onLoading: Consumer<Consumer<void>>;
    onLoad: Consumer<Consumer<T>>;
    onError: Consumer<Consumer<E>>;
}