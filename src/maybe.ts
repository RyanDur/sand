import {Maybe} from './types';
import {shallowFreeze} from './util';

const none: Maybe.None = 'None';
const someValue = <T>(value: T): Maybe.Some<T> => () => value;

const pipeline = <T>(value: Maybe.Value<T>): Maybe.Pipeline<T> => shallowFreeze({
    map: mapping => pipeline(value === none ? value : someValue(mapping(value()))),
    orElse: other => value === none ? other : value()
});

const some = <T>(value?: T): Maybe.Pipeline<T> => pipeline(value ? someValue(value) : none);

export const maybe = {
    none,
    some
};