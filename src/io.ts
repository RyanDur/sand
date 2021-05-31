import {Supplier} from './types';
import {compose, inspect} from './util';
import {IO} from './types/IO';

const io = <T>(impureIO: Supplier<T>): IO<T> => ({
    perform: impureIO,
    value: () => impureIO(),
    orElse: other => impureIO() || other,
    orNull: () => impureIO() || null,
    map: f => io(compose(f, impureIO)),
    inspect: () => `IO(${inspect(impureIO)})`
});
