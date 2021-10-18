import {Supplier} from './Function';

export interface Maybe<THING> {
    readonly isNothing: boolean;
    readonly orElse: (fallback: THING) => THING;
    readonly orNull: Supplier<THING | null>;
    readonly map: <NEW_THING>(f: (value: THING) => NEW_THING) => Maybe<NEW_THING>;
    readonly flatMap: <NEW_THING>(f: (value: THING) => Maybe<NEW_THING>) => Maybe<NEW_THING>;
    readonly inspect: Supplier<string>;
}