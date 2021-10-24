import {inspect, shallowFreeze} from '../lib/util';
import {IO} from './types/IO';
import {Supplier} from '../lib/types';

export const io = <T>(impureIO: Supplier<T>): IO<T> => shallowFreeze({
    perform: impureIO,
    orElse: other => impureIO() || other,
    map: f => io(() => f(impureIO())),
    flatMap: f => f(impureIO()),
    inspect: () => `IO(${inspect(impureIO)})`
});
