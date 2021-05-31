import {Func} from './types';
import {inspect, shallowFreeze} from './util';
import {Explanation} from './types/Explanation';

export const explanation: Func = <E>(reason: E): Explanation<E> => shallowFreeze({
    map: f => explanation(f(reason)),
    value: () => reason,
    orElse: other => reason || other,
    orNull: () => reason || null,
    inspect: () => `Explanation(${inspect(reason)})`
});