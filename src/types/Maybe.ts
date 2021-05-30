import {Functor} from '../util';

export declare namespace Maybe {
    type Some<T> = Functor<T> & {
        inspect: () => string;
        isNone: false;
    };
    type None<T> = Functor<T> & {
        inspect: () => string;
        isNone: true;
    };
}

export type Maybe<T> = Maybe.Some<T> | Maybe.None<T>;