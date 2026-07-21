import {expectTypeOf, test} from 'vitest';
import {failure, Failure, Nothing, Result, Some, Success, nothing, some, success} from '../..';

test('mBind keeps the value and error types', () => {
  const result = success<string, Error>('x').mBind(value => success<number, Error>(value.length));
  expectTypeOf(result).toEqualTypeOf<Result<number, Error>>();
});

test('or keeps the value type and can change the error type', () => {
  const result = failure<string, number>('e').or(() => success<number, boolean>(1));
  expectTypeOf(result).toEqualTypeOf<Result<number, boolean>>();
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
  const result: Result<string, Error> = success('x');
  if (result.isSuccess) expectTypeOf(result.value).toEqualTypeOf<string>();
  else expectTypeOf(result.reason).toEqualTypeOf<Error>();
});

test('Result.all changes the value type and keeps the error', () => {
  const result = Result.allOf([success<number>(1), success<number>(2)], (accumulator: string, value) => success(`${accumulator}${value}`), '');
  expectTypeOf(result).toEqualTypeOf<Result<string, never>>();
});
