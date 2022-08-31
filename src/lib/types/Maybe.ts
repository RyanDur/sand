import {Failure, Success} from './Result';

export type Maybe<THING> = Some<THING> | Nothing

export interface Some<THING> {
    readonly isNothing: false;
    readonly orElse: () => THING;
    readonly orNull: () => THING;
    readonly map: <NEW_THING>(f: (value: THING) => NEW_THING) => Some<NEW_THING>;
    readonly mBind: <NEW_THING>(f: (value: THING) => Maybe<NEW_THING>) => Maybe<NEW_THING>;
    readonly or: (f: unknown) => Some<THING>;
    readonly toResult: () => Success<THING>;
    readonly inspect: () => string;
}

export interface Nothing {
    readonly isNothing: true;
    readonly orElse: <THING>(fallback: THING) => THING;
    readonly orNull: () => null;
    readonly map: (f: unknown) => Nothing;
    readonly mBind: (f: unknown) => Nothing;
    readonly or: <THING>(f: () => Maybe<THING>) => Maybe<THING>;
    readonly toResult: () => Failure<undefined>;
    readonly inspect: () => string;
}
