import {Err, Ok} from './Result';

export type Maybe<THING> = Some<THING> | Nothing

export interface Some<THING> {
    readonly isNothing: false;
    readonly orElse: () => THING;
    readonly orNull: () => THING;
    readonly map: <NEW_THING>(f: (value: THING) => NEW_THING) => Some<NEW_THING>;
    readonly mBind: <NEW_THING>(f: (value: THING) => Maybe<NEW_THING>) => Maybe<NEW_THING>;
    readonly or: () => Some<THING>;
    readonly toResult: () => Ok<THING>;
    readonly inspect: () => string;
}

export interface Nothing {
    readonly isNothing: true;
    readonly orElse: <T>(fallback: T) => T;
    readonly orNull: () => null;
    readonly map: () => Nothing;
    readonly mBind: () => Nothing;
    readonly or: <T>(f: () => Maybe<T>) => Maybe<T>;
    readonly toResult: () => Err<undefined>;
    readonly inspect: () => string;
}
