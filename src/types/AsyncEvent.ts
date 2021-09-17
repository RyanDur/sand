export interface Event<T> {
    type: T;
}

export type Loaded<T> = Event<AsyncState.LOADED> & {
    data: T;
};
export type Loading = Event<AsyncState.LOADING>;

export type Error<E> = Event<AsyncState.ERROR> & {
    reason?: E;
};

export type AsyncEvent<T, E> = Loaded<T> | Loading | Error<E>

export enum AsyncState {
    LOADING = 'LOADING',
    LOADED = 'LOADED',
    ERROR = 'ERROR'
}

export interface OnEvent<T, E> {
    on: (dispatch: (event: AsyncEvent<T, E>) => void) => void
}