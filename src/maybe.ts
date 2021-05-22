import {Maybe} from './types';
import {shallowFreeze, typeOf} from './util';

const none: Maybe.None = 'None';
const someValue = <T>(value: T): Maybe.Some<T> => () => value;

const pipeline = <T>(value: Maybe.Value<T>): Maybe.Pipeline<T> => shallowFreeze({
    map: mapping => pipeline(value === none ? value : someValue(mapping(value()))),
    orElse: other => value === none ? other : value()
});

const isNoneType = (value: unknown): boolean => {
    const type = typeOf(value);
    return type === 'undefined' || type === 'null' || type === 'NaN';
};

export const maybe = <T>(value?: T): Maybe.Pipeline<T> =>
    pipeline(isNoneType(value) ? none : someValue(value as T));