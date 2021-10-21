# Sand

I made this little library of helper functions to aid my development of javascript/typescript applications and learn
more about the functional paradigm.

### [Result](https://github.com/RyanDur/sand/blob/main/src/lib/types/Result.ts)

The Result is either ok or not. Depending on what type of result it is affects how the results functions behave. For
example, the 'orNull' function for an ok result will return the value of the result while err will return null.

interface:

```typescript
type Result<DATA, REASON> = Result.Ok<DATA, REASON> | Result.Err<DATA, REASON>;

declare namespace Result {
    interface Ok<DATA, REASON> {
        readonly isOk: true;
        readonly data: DATA;
        readonly orNull: Supplier<DATA | null>;
        readonly orElse: (fallback: DATA) => DATA;
        readonly errOrElse: (fallback: REASON) => REASON;
        readonly map: <NEW_DATA>(mapper: (data: DATA) => NEW_DATA) => Result<NEW_DATA, REASON>;
        readonly mapErr: <NEW_REASON>(mapper: (reason: REASON) => NEW_REASON) => Result<DATA, NEW_REASON>;
        readonly flatMap: <NEW_DATA>(mapper: (data: DATA) => Result<NEW_DATA, REASON>) => Result<NEW_DATA, REASON>;
        readonly flatMapErr: <NEW_REASON>(mapper: (reason: REASON) => Result<DATA, NEW_REASON>) => Result<DATA, NEW_REASON>;
        readonly onOk: (consumer: Consumer<DATA>) => Result<DATA, REASON>;
        readonly onErr: (consumer: Consumer<REASON>) => Result<DATA, REASON>;
        readonly inspect: Supplier<string>;
    }

    interface Err<DATA, REASON> {
        readonly isOk: false;
        readonly reason: REASON;
        readonly orNull: Supplier<DATA | null>;
        readonly orElse: (fallback: DATA) => DATA;
        readonly errOrElse: (fallback: REASON) => REASON;
        readonly map: <NEW_DATA>(mapper: (data: DATA) => NEW_DATA) => Result<NEW_DATA, REASON>;
        readonly mapErr: <NEW_REASON>(mapper: (reason: REASON) => NEW_REASON) => Result<DATA, NEW_REASON>;
        readonly flatMap: <NEW_DATA>(mapper: (data: DATA) => Result<NEW_DATA, REASON>) => Result<NEW_DATA, REASON>;
        readonly flatMapErr: <NEW_REASON>(mapper: (reason: REASON) => Result<DATA, NEW_REASON>) => Result<DATA, NEW_REASON>;
        readonly onOk: (consumer: Consumer<DATA>) => Result<DATA, REASON>;
        readonly onErr: (consumer: Consumer<REASON>) => Result<DATA, REASON>;
        readonly inspect: Supplier<string>;
    }
}
```

### [result](https://github.com/RyanDur/sand/blob/main/src/lib/result.ts)

A factory for creating Result's

interface:

```typescript
ok: <DATA, REASON>(data: DATA) => Result<DATA, REASON>;
err: <DATA, REASON>(reason: REASON) => Result<DATA, REASON>;
```

* [test for ok](https://github.com/RyanDur/sand/blob/main/src/lib/__tests__/result.spec.ts#L9)
* [test for err](https://github.com/RyanDur/sand/blob/main/src/lib/__tests__/result.spec.ts#L29)

Example:

```javascript
var okResult = result.ok('some value').map(value => value + ', another value');
okResult.orNull(); // produces: "some value, another value"
okResult.errOrElse('definately this'); // produces: "definately this"

const errResult = result.err('some err').mapErr(value => value + ', another err');
errResult.orNull(); // produces: null
errResult.errOrElse('Not this'); // produces: "some err, another err"
```

### [AsyncResult](https://github.com/RyanDur/sand/blob/main/src/lib/types/Result.ts)

The AsyncResult is something that [Damien LeBerrigaud](https://github.com/dam5s) has introduced me to. I had the chance
to work with him on a project that inspired me to write this lib. Together we collaborated
on [React Redux Starter](https://github.com/dam5s/react-redux-starter) to aid us in developing future projects with
clients.

The type allows you to work with a promise in the same way you would work with a Result, with some extra helpers.

interface:

```typescript
namespace Result {
    interface Async<SUCCESS, FAILURE> {
        readonly orNull: Supplier<Promise<SUCCESS | null>>;
        readonly orElse: (fallback: SUCCESS) => Promise<SUCCESS>;
        readonly failureOrElse: (fallback: FAILURE) => Promise<FAILURE>;
        readonly map: <NEW_SUCCESS>(mapping: (data: SUCCESS) => NEW_SUCCESS) => Async<NEW_SUCCESS, FAILURE>;
        readonly mapFailure: <NEW_FAILURE>(mapping: (reason: FAILURE) => NEW_FAILURE) => Async<SUCCESS, NEW_FAILURE>;
        readonly flatMap: <NEW_SUCCESS>(mapping: (data: SUCCESS) => Async<NEW_SUCCESS, FAILURE>) => Async<NEW_SUCCESS, FAILURE>;
        readonly flatMapFailure: <NEW_FAILURE>(mapping: (reason: FAILURE) => Async<SUCCESS, NEW_FAILURE>) => Async<SUCCESS, NEW_FAILURE>;
        /**
         * A function that notifies the consuming function of the pending state.
         *
         * <p>Upon invocation it will pass true to the consumer.
         * Once the call has finished it will pass false to the consumer.</p>
         *
         * @remarks
         * The provided consumer gets called twice.
         *
         * @param consumer - consumes the pending state.
         * */
        readonly onPending: (consumer: Consumer<boolean>) => Async<SUCCESS, FAILURE>;
        readonly onSuccess: (consumer: Consumer<SUCCESS>) => Async<SUCCESS, FAILURE>;
        readonly onFailure: (consumer: Consumer<FAILURE>) => Async<SUCCESS, FAILURE>;
        readonly onComplete: (consumer: Consumer<Result<SUCCESS, FAILURE>>) => Async<SUCCESS, FAILURE>;
        readonly inspect: Supplier<string>;
    }
}
```

### [asyncResult](https://github.com/RyanDur/sand/blob/main/src/lib/asyncResult.ts)

A factory for creating AsyncResult's

interface:

```typescript
of: <SUCCESS, FAILURE>(promise: Promise<SUCCESS>) => Result.Async<SUCCESS, FAILURE>;
success: <SUCCESS, FAILURE>(value: SUCCESS) => Result.Async<SUCCESS, FAILURE>;
failure: <SUCCESS, FAILURE>(error: FAILURE) => Result.Async<SUCCESS, FAILURE>;
```

* [test for success](https://github.com/RyanDur/sand/blob/main/src/lib/__tests__/asyncResult.spec.ts#L11)
* [test for failure](https://github.com/RyanDur/sand/blob/main/src/lib/__tests__/asyncResult.spec.ts#L48)

Example:

```javascript
var successfulResult = await asyncResult.of(Promise.resolve('some value')).map(value => value + ', another value');
successfulResult.orNull(); // produces: "some value, another value"
successfulResult.failureOrElse('definately this'); // produces: "definately this"

const failureResult = await asyncResult.of(Promise.reject('some err')).mapErr(value => value + ', another err');
failureResult.orNull(); // produces: null
failureResult.failureOrElse('Not this'); // produces: "some err, another err"
```

### [Maybe](https://github.com/RyanDur/sand/blob/main/src/lib/types/Maybe.ts)

A Maybe is either something or nothing.

interface:

```typescript
interface Maybe<THING> {
    readonly isNothing: boolean;
    readonly orElse: (fallback: THING) => THING;
    readonly orNull: Supplier<THING | null>;
    readonly map: <NEW_THING>(f: (value: THING) => NEW_THING) => Maybe<NEW_THING>;
    readonly flatMap: <NEW_THING>(f: (value: THING) => Maybe<NEW_THING>) => Maybe<NEW_THING>;
    readonly inspect: Supplier<string>;
};
```

### [maybe](https://github.com/RyanDur/sand/blob/main/src/lib/maybe.ts)

A factory for creating a Maybe.

interface:

```typescript
of: <THING>(thing?: THING | null, isNothing = isNothingValue) => Maybe<THING>;
some: <THING>(thing: THING) => Maybe<THING>;
nothing: <THING>() => Maybe<THING>;
```

* [test for something or nothing](https://github.com/RyanDur/sand/blob/main/src/lib/__tests__/maybe.spec.ts)

Example:

```javascript
maybe.of('something').map(value => value + ' more').orNull() // produces: "something more"
maybe.of(null).map(value => value + ' more').orNull() // produces: null
maybe.of(undefined).map(value => value + ' more').orNull() // produces: null
maybe.of(NaN).map(value => value + ' more').orNull() // produces: null
```

## Util

### [not](https://github.com/RyanDur/sand/blob/main/src/lib/util/index.ts)

```typescript
not: (value: unknown) => boolean;
```

Will negate any boolean or truthy or falsy value.

Example:

```javascript
not(true) // produces: false
not(false) // produces: true
```

### [empty](https://github.com/RyanDur/sand/blob/main/src/lib/util/index.ts)

```typescript
empty: (value: unknown) => boolean;
```

* [test for empty](https://github.com/RyanDur/sand/blob/main/src/lib/util/__tests__/util.spec.ts#L7)

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

### [has](https://github.com/RyanDur/sand/blob/main/src/lib/util/index.ts)

```typescript
has: (value: unknown) => boolean;
```

A value that
is [not](https://github.com/RyanDur/sand/blob/main/src/lib/util/index.ts) [empty](https://github.com/RyanDur/sand/blob/main/src/lib/util/index.ts)
.

* [test for has](https://github.com/RyanDur/sand/blob/main/src/lib/util/__tests__/util.spec.ts#L65)

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

### [matchOn](https://github.com/RyanDur/sand/blob/main/src/lib/util/index.ts)

```typescript
matchOn: <MATCH extends string | number>(
    matches: MATCH[]
) => <VALUE>(
    on: MATCH | null = null,
    cases: Record<MATCH, () => VALUE>
) => Maybe<VALUE>;
```

* [test for matchOn](https://github.com/RyanDur/sand/blob/main/src/lib/util/__tests__/util.spec.ts#L123)

Example:

```typescript
enum Thing {
    One = 'One',
    Two = 'Two',
    Three = 'Three'
}

const matchThings = matchOn(Object.values(Thing));

matchThings(Thing.Two, {
    [Thing.One]: () => 'I am one',
    [Thing.Two]: () => 'I am two',
    [Thing.Three]: () => 'I am three',
}).orElse('none of the above'); // produces: "I am two"

matchThings(undefined, {
    [Thing.One]: () => 'I am one',
    [Thing.Two]: () => 'I am two',
    [Thing.Three]: () => 'I am three',
}).orElse('none of the above'); // produces: "none of the above"
```

## Examples of use

[Gallery](http://localhost:3000/gallery?page=1&size=8&tab=aic)

[Gallery implementation](https://github.com/RyanDur/ChosenPicachu/tree/main/src/lib/components/Gallery)

* [Art](https://github.com/RyanDur/ChosenPicachu/blob/main/src/lib/components/Gallery/Art/index.tsx#L19)
* [ArtPiece](https://github.com/RyanDur/ChosenPicachu/blob/main/src/lib/components/Gallery/ArtPiece/index.tsx#L19)