import {Result} from './Result';

export type Maybe<THING> = Some<THING> | Nothing

export interface Some<THING> {
    readonly isNothing: false;
    readonly orNull: () => THING;
    readonly orElse: (fallback: THING) => THING;
    readonly map: <NEW_THING>(f: (value: THING) => NEW_THING) => Some<NEW_THING>;
    readonly mBind: <NEW_THING>(f: (value: THING) => Maybe<NEW_THING>) => Maybe<NEW_THING>;
    readonly or: (f: () => Maybe<THING>) => Maybe<THING>;
    readonly and: <NEW_THING>(other: Maybe<NEW_THING>) => Maybe<[THING, NEW_THING]>;
    readonly toResult: <ERROR>(fallback: ERROR) => Result<THING, ERROR>;
    readonly inspect: () => string;
}

export interface Nothing {
    readonly isNothing: true;
    readonly orElse: <THING>(fallback: THING) => THING;
    readonly orNull: () => null;
    readonly map: <NEW_THING>(f: (value: never) => NEW_THING) => Nothing;
    readonly mBind: <NEW_THING>(f: (value: never) => Maybe<NEW_THING>) => Maybe<NEW_THING>;
    readonly or: <THING>(f: () => Maybe<THING>) => Maybe<THING>;
    readonly and: (other: Maybe<unknown>) => Nothing;
    readonly toResult: <ERROR>(fallback: ERROR) => Result<never, ERROR>;
    readonly inspect: () => string;
}
