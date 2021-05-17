import {Mapping} from './index';

export declare namespace Maybe {
    type Some<T> = () => T;
    type None = 'None';
    type Value<T> = Some<T> | None

    interface Pipeline<T> {
        readonly map: <U>(mapping: Mapping<T, U>) => Pipeline<U>;
        readonly orElse: (other: T) => T;
    }
}