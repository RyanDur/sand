import {Supplier} from '../../types';

export type Inspectable = {
    inspect: Supplier<string>;
}

export type IsEmpty = {
    isEmpty: Supplier<boolean>
}
