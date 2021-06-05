import {inspect, shallowFreeze} from './util';
import {IO} from './types/IO';
import {Supplier} from './function/types';

export const io = <T>(impureIO: Supplier<T>): IO<T> => shallowFreeze({
    perform: impureIO,
    orElse: other => impureIO() || other,
    map: f => io(() => f(impureIO())),
    flatMap: f => f(impureIO()),
    inspect: () => `IO(${inspect(impureIO)})`
});
