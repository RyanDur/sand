import {allOf, asyncSuccess, failure, Failure, has, Maybe, Nothing, notEmpty, Result, Some, Success, nothing, some, success} from '../..';

test('mBind unions the error type when a success binds into a failure', () => {
  const result = success('a').mBind(() => failure('b'));
  expectTypeOf(result).toEqualTypeOf<Result<never, string>>();
});

test('mBind keeps a shared error type through the chain', () => {
  const result = success<string, Error>('x').mBind(value => success<number, Error>(value.length));
  expectTypeOf(result).toEqualTypeOf<Result<number, Error>>();
});

test('or unions the value type when a failure recovers into a success', () => {
  const result = failure('e').or(() => success('w'));
  expectTypeOf(result).toEqualTypeOf<Result<string, never>>();
});

test('orElse on a failure returns the fallback type', () => {
  expectTypeOf(failure('e').orElse('fallback')).toEqualTypeOf<string>();
});

test('either returns the union of both branch results', () => {
  const folded = failure<string, number>('e').either(value => value, reason => reason.length);
  expectTypeOf(folded).toEqualTypeOf<number>();
});

test('map on a success stays a Success and keeps the error type', () => {
  const result = success<number, string>(1).map(value => `${value}`);
  expectTypeOf(result).toEqualTypeOf<Success<string, string>>();
});

test('map on a failure stays a Failure and keeps the error type', () => {
  const result = failure<string, number>('e').map(value => `${value}`);
  expectTypeOf(result).toEqualTypeOf<Failure<string, string>>();
});

test('map on a some stays a Some', () => {
  expectTypeOf(some(1).map(value => `${value}`)).toEqualTypeOf<Some<string>>();
});

test('map on a nothing stays a Nothing', () => {
  expectTypeOf(nothing().map(value => `${value}`)).toEqualTypeOf<Nothing>();
});

test('isSuccess narrows the union', () => {
  const narrow = (result: Result<string, Error>) => {
    if (result.isSuccess) expectTypeOf(result.value).toEqualTypeOf<string>();
    else expectTypeOf(result.reason).toEqualTypeOf<Error>();
  };
  narrow(success<string, Error>('x'));
});

test('allOf over results infers a Result, changing the value type and keeping the error', () => {
  const result = allOf([success<number>(1), success<number>(2)], (accumulator: string, value) => success(`${accumulator}${value}`), success(''));
  expectTypeOf(result).toEqualTypeOf<Result<string, never>>();
});

test('allOf over maybes infers a Maybe', () => {
  const result = allOf([some(1), some(2)], (accumulator: string, value) => some(`${accumulator}${value}`), some(''));
  expectTypeOf(result).toEqualTypeOf<Maybe<string>>();
});

test('allOf over async results infers an async Result', () => {
  const result = allOf([asyncSuccess<number, Error>(1)], (accumulator: string, value) => asyncSuccess(`${accumulator}${value}`), asyncSuccess(''));
  expectTypeOf(result.orNull()).resolves.toEqualTypeOf<string | null>();
  expectTypeOf(result.onFailure).parameter(0).parameter(0).toEqualTypeOf<Error>();
});

test('has narrows null and undefined off the value it guards', () => {
  const narrow = (value?: string) => {
    if (has(value)) expectTypeOf(value).toEqualTypeOf<string>();
  };
  narrow('text');
});

test('notEmpty narrows the same way', () => {
  const narrow = (value: number | null) => {
    if (notEmpty(value)) expectTypeOf(value).toEqualTypeOf<number>();
  };
  narrow(1);
});
