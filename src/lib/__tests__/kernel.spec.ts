import {Monad, Catamorphism, foldAll, foldSome} from '../kernel';
import {lawsOf} from '../laws';
import {failure, success} from '../..';
import {Result} from '../types';

// oxlint-disable-next-line typescript/consistent-type-definitions -- the type-alias form of a recursive capability composition is TS2456-circular; extends is the only spelling
interface Counted extends Monad<number, Counted>, Catamorphism<number, Counted> {
  count: number;
}

const counted = (count: number): Counted => ({
  count,
  mBind: f => f(count),
  either: onHit => onHit(count)
});

const missed = (): Counted => {
  const self: Counted = {
    count: 0,
    mBind: () => self,
    either: (_onHit, onMiss) => onMiss()
  };
  return self;
};

describe('the kernel folds any type a user mints, not just the shipped ones', () => {
  test('a hand-rolled two-branch type chains through foldAll on structure alone', () => {
    const total = foldAll<number, number, Counted>(
      [counted(1), counted(2), counted(3)],
      (accumulator, value) => counted(accumulator + value),
      counted(0)
    );
    expect(total.count).toEqual(6);
  });

  test('the shipped Result folds through the same engine', () => {
    const total = foldAll<number, number, Result<number, string>>(
      [success(1), success(2)],
      (accumulator, value) => success(accumulator + value),
      success(0)
    );
    expect(total.orNull()).toEqual(3);
  });

  test('one failure poisons the whole fold, exactly as Result.reduce.all pins', () => {
    const total = foldAll<number, number, Result<number, string>>(
      [success(1), failure('boom'), success(3)],
      (accumulator, value) => success(accumulator + value),
      success(0)
    );
    expect(total.orElse('poisoned')).toEqual('poisoned');
  });
});

describe('foldSome forgives the items that miss, whatever type folds', () => {
  test('a hand-rolled type keeps the reductions that land and skips the misses', () => {
    const total = foldSome<number, number, Counted>(
      [counted(1), missed(), counted(3)],
      (accumulator, value) => counted(accumulator + value),
      counted(0)
    );
    expect(total.count).toEqual(4);
  });

  test('the shipped Result skips its failures through the same engine', () => {
    const total = foldSome<number, number, Result<number, string>>(
      [success(1), failure('x'), success(3)],
      (accumulator, value) => success(accumulator + value),
      success(0)
    );
    expect(total.orNull()).toEqual(4);
  });
});

describe('a user-minted type proves its own laws through the same harness', () => {
  type Lawful = {
    count: number;
    hit: boolean;
    mBind(f: (value: number) => Lawful): Lawful;
    map(f: (value: number) => number): Lawful;
  };
  const lawful = (count: number): Lawful => ({
    count,
    hit: true,
    mBind: f => f(count),
    map: f => lawful(f(count))
  });
  const unlawful = (): Lawful => {
    const self: Lawful = {count: 0, hit: false, mBind: () => self, map: () => self};
    return self;
  };
  const eq = (left: Lawful, right: Lawful): void => {
    expect(left.count).toEqual(right.count);
    expect(left.hit).toEqual(right.hit);
  };
  const laws = lawsOf<Lawful, void>(lawful, eq);

  test('monad left identity', laws.leftIdentity);
  test('monad right identity holds on both branches', () => {
    laws.rightIdentity(lawful(3));
    laws.rightIdentity(unlawful());
  });
  test('monad associativity holds on both branches', () => {
    laws.associativity(lawful(3));
    laws.associativity(unlawful());
  });
  test('functor identity holds on both branches', () => {
    laws.mapIdentity(lawful(3));
    laws.mapIdentity(unlawful());
  });
  test('functor composition holds on both branches', () => {
    laws.mapComposition(lawful(3));
    laws.mapComposition(unlawful());
  });
});
