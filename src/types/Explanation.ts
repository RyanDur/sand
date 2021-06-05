import {Func, Supplier} from '../function/types';

export type Explanation<E> = {
    readonly value: Supplier<E>;
    readonly orElse: Func<E, E>;
    readonly orNull: Supplier<E | null>;
    readonly map: <NewE>(f: Func<E, NewE>) => Explanation<NewE>;
    readonly flatMap: <NewG>(f: Func<E, Explanation<NewG>>) => Explanation<NewG>;
    readonly inspect: Supplier<string>;
}