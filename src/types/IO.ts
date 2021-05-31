import {Functor, Inspectable, Supplier, Suppliers} from './index';

export type IO<T> =
    & Functor<T>
    & Inspectable
    & Suppliers<T>
    & { readonly perform: Supplier<T>; }