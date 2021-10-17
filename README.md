# Sand

## Main

### [Result](https://github.com/RyanDur/sand/blob/main/src/types/Result.ts)

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

[test for has](https://github.com/RyanDur/sand/blob/main/src/util/__tests__/util.spec.ts#L65)

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

### [matchOn](https://github.com/RyanDur/sand/blob/main/src/util/index.ts)

#### [matches](https://github.com/RyanDur/sand/blob/main/src/util/index.ts)

[test for matching](https://github.com/RyanDur/sand/blob/main/src/util/__tests__/util.spec.ts#L123)

Example:

```typescript
enum Foo {
    One = 'One',
    Two = 'Two',
    Three = 'Three'
}

const thingsToMatchOn = matches(Object.values(Foo));

const matchThings = matchOn(thingsToMatchOn);

matchThings(Foo.Two, {
    [Foo.One]: () => 'I am one',
    [Foo.Two]: () => 'I am two',
    [Foo.Three]: () => 'I am three',
}).orElse('none of the above'); // prodices: "I am two"

matchThings(undefined as Foo, {
    [Foo.One]: () => 'I am one',
    [Foo.Two]: () => 'I am two',
    [Foo.Three]: () => 'I am three',
}).orElse('none of the above'); // prodices: "none of the above"
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