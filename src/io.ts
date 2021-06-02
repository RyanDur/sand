import {Supplier} from './types';
import {compose, inspect} from './util';
import {IO} from './types/IO';

const io = <T>(impureIO: Supplier<T>): IO<T> => ({
    perform: impureIO,
    orElse: other => impureIO() || other,
    map: f => io(compose(f, impureIO)),
    flatMap: f => f(impureIO()),
    inspect: () => `IO(${inspect(impureIO)})`
});
