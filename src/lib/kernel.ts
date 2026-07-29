/**
 * The endomorphic fragment of a Functor: the structural shape cannot speak the
 * family's own re-instantiation at a new value type, so it captures map at one
 * value type — enough to state the functor laws (identity and composition),
 * proven per family in laws.spec.
 * */
export type Functor<VALUE, OUT> = {
  map(f: (value: VALUE) => VALUE): OUT;
};

/**
 * The bind fragment of a Monad: the structural shape cannot carry unit — that
 * is the family's own constructor — so a family earns the name by proving the
 * monad laws with its unit in laws.spec. The shipped containers
 * (Result, Maybe, Result.Async) all do; a type you mint yourself proves its
 * own through the same harness.
 * */
export type Monad<VALUE, OUT> = {
  mBind(f: (value: VALUE) => OUT): OUT;
};

export const foldAll = <VALUE, ACC, OUT extends Monad<ACC, OUT>>(
  items: readonly Monad<VALUE, OUT>[],
  reducer: (accumulator: ACC, value: VALUE) => OUT,
  seed: OUT
): OUT =>
  items.reduce(
    (accumulator: OUT, item) => accumulator.mBind(acc => item.mBind(value => reducer(acc, value))),
    seed
  );

/**
 * The catamorphism of a two-branch sum: one fold that eliminates both cases.
 * foldSome rides it — the miss branch keeps the accumulator already earned.
 * */
export type Catamorphism<VALUE, OUT> = {
  either(onHit: (value: VALUE) => OUT, onMiss: () => OUT): OUT;
};

export const foldSome = <VALUE, ACC, OUT extends Monad<ACC, OUT>>(
  items: readonly Catamorphism<VALUE, OUT>[],
  reducer: (accumulator: ACC, value: VALUE) => OUT,
  seed: OUT
): OUT =>
  items.reduce(
    (accumulator: OUT, item) =>
      accumulator.mBind(acc => item.either(value => reducer(acc, value), () => accumulator)),
    seed
  );
