import {Catamorphism, Functor, Monad} from '../kernel';
import {Maybe, Result} from '../types';

test('Result is Monad and Catamorphism — both engines consume it', () => {
  expectTypeOf<Result<number, string>>().toExtend<Monad<number, Result<number, string>>>();
  expectTypeOf<Result<number, string>>().toExtend<
    Catamorphism<number, Result<number, string>>
  >();
});

test('Async is Monad and Catamorphism', () => {
  expectTypeOf<Result.Async<number, string>>().toExtend<
    Monad<number, Result.Async<number, string>>
  >();
  expectTypeOf<Result.Async<number, string>>().toExtend<
    Catamorphism<number, Result.Async<number, string>>
  >();
});

test('Maybe is Monad and Catamorphism — either closed the lattice', () => {
  expectTypeOf<Maybe<number>>().toExtend<Monad<number, Maybe<number>>>();
  expectTypeOf<Maybe<number>>().toExtend<Catamorphism<number, Maybe<number>>>();
});

test('every shipped container is a Functor', () => {
  expectTypeOf<Result<number, string>>().toExtend<Functor<number, Result<number, string>>>();
  expectTypeOf<Maybe<number>>().toExtend<Functor<number, Maybe<number>>>();
  expectTypeOf<Result.Async<number, string>>().toExtend<
    Functor<number, Result.Async<number, string>>
  >();
});

test('a user-minted type conforms to the capabilities its structure implements', () => {
  type Counted = {
    count: number;
    mBind(f: (value: number) => Counted): Counted;
    either(onHit: (value: number) => Counted, onMiss: () => Counted): Counted;
  };
  expectTypeOf<Counted>().toExtend<Monad<number, Counted>>();
  expectTypeOf<Counted>().toExtend<Catamorphism<number, Counted>>();
});
