# Sand

### [Result](https://github.com/RyanDur/sand/blob/main/src/types/Result.ts)

interface:

```typescript
type Result<T, E> = (Result.Ok<T> | Result.Err<E>) & {
    readonly orElse: Func<T, T>;
    readonly errOrElse: Func<E, E>;
    readonly orNull: Supplier<T | null>;
    readonly map: <NewT>(f: Func<T, NewT>) => Result<NewT, E>;
    readonly mapErr: <NewE>(f: Func<E, NewE>) => Result<T, NewE>;
    readonly flatMap: <NewT>(f: Func<T, Result<NewT, E>>) => Result<NewT, E>;
    readonly flatMapErr: <NewE>(f: Func<E, Result<T, NewE>>) => Result<T, NewE>;
    readonly onOk: Func<Consumer<T>, Result<T, E>>;
    readonly onErr: Func<Consumer<E>, Result<T, E>>;
    readonly inspect: Supplier<string>;
}

namespace Result {
    type Ok<T> = {
        readonly isOk: true;
        readonly data: T;
    }

    type Err<E> = {
        readonly isOk: false;
        readonly reason: E;
    }
}
```

### [result](https://github.com/RyanDur/sand/blob/main/src/result.ts)

interface:

```typescript
ok: <T, E>(data: T) => Result<T, E>;
err: <T, E>(reason: E) => Result<T, E>;
```

* [test for ok](https://github.com/RyanDur/sand/blob/main/src/__tests__/result.spec.ts#L9)
* [test for err](https://github.com/RyanDur/sand/blob/main/src/__tests__/result.spec.ts#L29)

Example:

```javascript
var okResult = result.ok('some value').map(value => value + ', another value');
okResult.orNull(); // produces: "some value, another value"
okResult.errOrElse('definately this'); // produces: "definately this"

const errResult = result.err('some err').mapErr(value => value + ', another err');
errResult.orNull(); // produces: null
errResult.errOrElse('Not this'); // produces: "some err, another err"
```

### [AsyncResult](https://github.com/RyanDur/sand/blob/main/src/types/Result.ts)

interface:

```typescript
namespace Result {
    type Async<S, F> = {
        readonly orNull: Supplier<Promise<S | null>>;
        readonly orElse: Func<S, Promise<S>>;
        readonly failureOrElse: Func<F, Promise<F>>;
        readonly map: <NewS>(mapping: Func<S, NewS>) => Async<NewS, F>;
        readonly mapFailure: <NewF>(mapping: Func<F, NewF>) => Async<S, NewF>;
        readonly flatMap: <NewS>(mapping: Func<S, Async<NewS, F>>) => Async<NewS, F>;
        readonly flatMapFailure: <NewF>(mapping: Func<F, Async<S, NewF>>) => Async<S, NewF>;
        readonly onLoading: Func<Consumer<boolean>, Async<S, F>>;
        readonly onSuccess: Func<Consumer<S>, Async<S, F>>;
        readonly onFailure: Func<Consumer<F>, Async<S, F>>;
        readonly onComplete: Func<Consumer<Result<S, F>>, Async<S, F>>;
        readonly inspect: Supplier<string>;
    }
}
```

### [asyncResult](https://github.com/RyanDur/sand/blob/main/src/asyncResult.ts)

interface:

```typescript
of: <S, F>(promise: Promise<S>) => Result.Async<S, F>;
success: <S, F>(value: S) => Result.Async<S, F>;
failure: <S, F>(error: F) => Result.Async<S, F>;
```

* [test for success](https://github.com/RyanDur/sand/blob/main/src/__tests__/asyncResult.spec.ts#L11)
* [test for failure](https://github.com/RyanDur/sand/blob/main/src/__tests__/asyncResult.spec.ts#L48)

Example:

```javascript
var successfulResult = await asyncResult.of(Promise.resolve('some value')).map(value => value + ', another value');
successfulResult.orNull(); // produces: "some value, another value"
successfulResult.failureOrElse('definately this'); // produces: "definately this"

const failureResult = await asyncResult.of(Promise.reject('some err')).mapErr(value => value + ', another err');
failureResult.orNull(); // produces: null
failureResult.failureOrElse('Not this'); // produces: "some err, another err"
```

### [Maybe](https://github.com/RyanDur/sand/blob/main/src/types/Maybe.ts)

interface:

```typescript
type Maybe<T> = {
    readonly isNothing: boolean;
    readonly orElse: Func<T, T>;
    readonly orNull: Supplier<T | null>;
    readonly map: <NewT>(f: Func<T, NewT>) => Maybe<NewT>;
    readonly flatMap: <NewT>(f: Func<T, Maybe<NewT>>) => Maybe<NewT>;
    readonly inspect: Supplier<string>;
};
```

### [maybe](https://github.com/RyanDur/sand/blob/main/src/maybe.ts)

interface:

```typescript
of: <THING>(thing?: THING | null, isNothing = isNothingValue) => Maybe<THING>;
some: <T>(thing: T) => Maybe<T>;
nothing: <T>() => Maybe<T>;
```

* [test for something or nothing](https://github.com/RyanDur/sand/blob/main/src/__tests__/maybe.spec.ts)

Example:

```javascript
maybe.of('something').map(value => value + ' more').orNull() // produces: "something more"
maybe.of(null).map(value => value + ' more').orNull() // produces: null
maybe.of(undefined).map(value => value + ' more').orNull() // produces: null
maybe.of(NaN).map(value => value + ' more').orNull() // produces: null
```

## Util

### [not](https://github.com/RyanDur/sand/blob/main/src/util/index.ts)

Will negate any boolean or truthy or falsy value.

Example:

```javascript
not(true) // produces: false
not(false) // produces: true
```

### [empty](https://github.com/RyanDur/sand/blob/main/src/util/index.ts)

* [test for empty](https://github.com/RyanDur/sand/blob/main/src/util/__tests__/util.spec.ts#L7)

Example:

```javascript
empty({}) // produces: true
empty({I: 'am not empty'}) // produces: false

empty([]) // produces: true
empty([1, 2, 3]) // produces: false

empty('') // produces: true
empty('not empty') // produces: false

empty(NaN) // produces: true
empty(0) // produces: false
```

### [has](https://github.com/RyanDur/sand/blob/main/src/util/index.ts)

A value that
is [not](https://github.com/RyanDur/sand/blob/main/src/util/index.ts) [empty](https://github.com/RyanDur/sand/blob/main/src/util/index.ts)
.

* [test for has](https://github.com/RyanDur/sand/blob/main/src/util/__tests__/util.spec.ts#L65)

Example:

```javascript
has({}) // produces: false
has({I: 'am not empty'}) // produces: true

has([]) // produces: false
has([1, 2, 3]) // produces: true

has('') // produces: false
has('not empty') // produces: true

has(NaN) // produces: false
has(0) // produces: true
```

### Matching

* [test for matching](https://github.com/RyanDur/sand/blob/main/src/util/__tests__/util.spec.ts#L123)

#### [matches](https://github.com/RyanDur/sand/blob/main/src/util/index.ts)

Example:

```typescript
enum Thing {
    One = 'One',
    Two = 'Two',
    Three = 'Three'
}

const thingsToMatchOn = matches(Object.values(Foo));
```

#### [matchOn](https://github.com/RyanDur/sand/blob/main/src/util/index.ts)

Example:

```typescript
const matchThings = matchOn(thingsToMatchOn);

matchThings(Thing.Two, {
    [Thing.One]: () => 'I am one',
    [Thing.Two]: () => 'I am two',
    [Thing.Three]: () => 'I am three',
}).orElse('none of the above'); // produces: "I am two"

matchThings(undefined as Thing, {
    [Thing.One]: () => 'I am one',
    [Thing.Two]: () => 'I am two',
    [Thing.Three]: () => 'I am three',
}).orElse('none of the above'); // produces: "none of the above"
```

### [inspect](https://github.com/RyanDur/sand/blob/main/src/util/index.ts)

provides a string representation of the object. If the object passed has an inspect method, it will invoke that or just
wrap the object in a string.

### [typeOf](https://github.com/RyanDur/sand/blob/main/src/util/index.ts)

My own typeOf, since the built in one will return object for null, and number for NaN.

### [shallowFreeze](https://github.com/RyanDur/sand/blob/main/src/util/index.ts)

Is a delegate for Object.freeze, the only thing that i ike about it is that it tells the user about how much it will
freeze

## Examples of use

[Gallery](http://localhost:3000/gallery?page=1&size=8&tab=aic)

[Gallery implementation](https://github.com/RyanDur/ChosenPicachu/tree/main/src/components/Gallery)

* [Art](https://github.com/RyanDur/ChosenPicachu/blob/main/src/components/Gallery/Art/index.tsx#L19)
* [ArtPiece](https://github.com/RyanDur/ChosenPicachu/blob/main/src/components/Gallery/ArtPiece/index.tsx#L19)