import {Result} from './Result';

export type Maybe<THING> = Some<THING> | Nothing

export interface Some<THING> {
    readonly isNothing: false;
    orNull(): THING;
    orElse<FALLBACK>(fallback: FALLBACK): THING;
    map<NEW_THING>(f: (value: THING) => NEW_THING): Some<NEW_THING>;
    mBind<NEW_THING>(f: (value: THING) => Maybe<NEW_THING>): Maybe<NEW_THING>;
    or(f: () => Maybe<THING>): Maybe<THING>;
    and<NEW_THING>(other: Maybe<NEW_THING>): Maybe<[THING, NEW_THING]>;
    toResult<ERROR>(fallback: ERROR): Result<THING, ERROR>;
    inspect(): string;
}

export interface Nothing {
    readonly isNothing: true;
    orElse<FALLBACK>(fallback: FALLBACK): FALLBACK;
    orNull(): null;
    map<NEW_THING>(f: (value: never) => NEW_THING): Nothing;
    mBind<NEW_THING>(f: (value: never) => Maybe<NEW_THING>): Maybe<NEW_THING>;
    or<THING>(f: () => Maybe<THING>): Maybe<THING>;
    and<OTHER>(other: Maybe<OTHER>): Nothing;
    toResult<ERROR>(fallback: ERROR): Result<never, ERROR>;
    inspect(): string;
}
