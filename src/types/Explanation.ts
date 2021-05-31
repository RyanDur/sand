import {Functor, Id, Inspectable, Suppliers} from './index';

export type Explanation<E> =
    & Functor<E>
    & Suppliers<E>
    & Inspectable
    & Id<E>