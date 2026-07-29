import {Functor, Monad} from './kernel';

/**
 * The law harness: hand it your type's unit and an equality, get back the
 * functor and monad laws as runnable assertions. The constraint is the
 * entry fee — your type must already be the capabilities it claims. The
 * shipped containers prove themselves with it in their own suites; a type
 * you mint yourself proves its laws the same way.
 *
 * ```ts
 * const laws = lawsOf<Mine, void>(mine, (left, right) => expect(left.value).toEqual(right.value));
 * laws.leftIdentity();
 * laws.rightIdentity(mine(3));
 * laws.associativity(mine(3));
 * laws.mapIdentity(mine(3));
 * laws.mapComposition(mine(3));
 * ```
 * */
export const lawsOf = <
  M extends Functor<number, M> & Monad<number, M>,
  VERDICT extends void | Promise<void>
>(
  unit: (value: number) => M,
  eq: (left: M, right: M) => VERDICT
) => {
  const f = (value: number): M => unit(value * 2);
  const g = (value: number): M => unit(value + 1);
  const double = (value: number): number => value * 2;
  const increment = (value: number): number => value + 1;
  return {
    leftIdentity: () => eq(unit(3).mBind(f), f(3)),
    rightIdentity: (m: M) => eq(m.mBind(unit), m),
    associativity: (m: M) => eq(m.mBind(f).mBind(g), m.mBind(value => f(value).mBind(g))),
    mapIdentity: (m: M) => eq(m.map(value => value), m),
    mapComposition: (m: M) =>
      eq(m.map(double).map(increment), m.map(value => increment(double(value))))
  };
};
