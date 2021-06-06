import {Supplier} from '../../function/types';

export interface Inspectable {
    inspect: Supplier<string>;
}

export interface IsEmpty {
    isEmpty: Supplier<boolean>
}