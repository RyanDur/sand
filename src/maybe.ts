import {Maybe} from './types';
import {shallowFreeze} from './util';

const none: Maybe.None = 'None';
const someValue = <T>(value: T): Maybe.Some<T> => () => value;

const pipeline = <T>(value: Maybe.Value<T>): Maybe.Pipeline<T> => shallowFreeze({
    map: mapping => pipeline(value === none ? value : someValue(mapping(value()))),
    orElse: other => value === none ? other : value()
});

const typeOf = <T>(type: T): string => {
    if (Number.isNaN(type)) {
        return 'NaN';
    } else if (type === null) {
        return 'null';
    } else {
        return typeof type;
    }
};

const isSomething = <T>(value: T): boolean => {
    switch (typeOf(value)) {
        case 'undefined':
        case 'null':
        case 'NaN':
            return false;
    }
    return true;
};

export const maybe = <T>(value?: T): Maybe.Pipeline<T> =>
    pipeline(isSomething(value) ? someValue(value as T) : none);