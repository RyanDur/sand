import {inspect, shallowFreeze} from './util';
import {Explanation} from './types';

export const explanation = <E>(reason: E): Explanation<E> => shallowFreeze({
    value: () => reason,
    orElse: other => reason || other,
    orNull: () => reason || null,
    map: f => explanation(f(reason)),
    flatMap: f => f(reason),
    inspect: () => `Explanation(${inspect(reason)})`
});
