import {Inspectable, Monad} from './index';

export declare namespace Maybe {
    type Some<T> = Monad<T> & Inspectable & {
        isNone: false;
    };
    type None<T> = Monad<T> & Inspectable & {
        isNone: true;
    };
}

export type Maybe<T> = Maybe.Some<T> | Maybe.None<T>;