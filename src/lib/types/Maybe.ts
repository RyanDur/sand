import {Result} from './Result';

export interface Maybe<THING> {
    readonly isNothing: boolean;
    readonly orElse: (fallback: THING) => THING;
    readonly orNull: () => THING | null;
    readonly map: <NEW_THING>(f: (value: THING) => NEW_THING) => Maybe<NEW_THING>;
    readonly mBind: <NEW_THING>(f: (value: THING) => Maybe<NEW_THING>) => Maybe<NEW_THING>;
    readonly or: (f: () => Maybe<THING>) => Maybe<THING>;
    readonly toResult: () => Result<THING, null>;
    readonly inspect: () => string;
}