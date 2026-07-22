# Sand

A library should support your decisions while allowing you to leave an impression for others to follow.

I made this little library of helper functions to aid my development of javascript/typescript applications and learn
more about the functional paradigm.

[Docs](https://ryandur.github.io/sand/modules.html)

![branches](./badges/coverage-branches.svg)  ![Functions](./badges/coverage-functions.svg)  ![lines](./badges/coverage-lines.svg)  ![statements](./badges/coverage-statements.svg)

## Install

```shell
npm install @ryandur/sand
```

## The pieces

### Result

A `Result` is either a `success` or a `failure`. Every operation on it says which side it cares about, so the
happy path chains without a single null check, and the failure rides along untouched until you decide what to
do with it.

```typescript
import {success, failure} from '@ryandur/sand';

success(2)
    .map(value => value + 1)
    .mBind(value => value > 0 ? success(value) : failure('negative'))
    .orElse(0); // produces: 3

failure<string, number>('boom')
    .map(value => value + 1) // never runs
    .orNull(); // produces: null
```

When both sides deserve an answer, fold the two branches into one value with `either`.

```typescript
success<number, string>(2).either(value => `got ${value}`, reason => `oops, ${reason}`); // produces: "got 2"
```

The types ride along with the chain: `mBind` unions in any new error type it introduces, `or` unions in any
new value type a recovery introduces, and nothing ever widens to `unknown`.

### Maybe

A `Maybe` is either `some` thing or `nothing`. The `maybe` factory decides for you: `null`, `undefined`, and
`NaN` become `nothing`, anything else becomes `some`.

```typescript
import {maybe, some, nothing} from '@ryandur/sand';

maybe('something').map(value => value + ' more').orNull(); // produces: "something more"
maybe(null).map(value => value + ' more').orNull(); // produces: null
maybe(NaN).orElse('fallback'); // produces: "fallback"

some(1).and(some(2)).map(([one, two]) => one + two).orNull(); // produces: 3
nothing().or(() => some('recovered')).orNull(); // produces: "recovered"
```

### AsyncResult

A `Result.Async` lets you work with a promise the same way you work with a `Result`, plus `onPending` for
loading states. The story below shows it in action.

### allOf / someOf

Both fold a batch onto a seed. `allOf` requires every item to succeed; `someOf` keeps the ones that do and
skips the ones that don't. Either way, a failure from the reducer itself fails the whole fold.

One function covers all three containers: the arguments carry the types, so whatever kind the seed is —
`Result`, `Maybe`, or `Result.Async` — is what comes back, with nothing annotated at the call site.

```typescript
import {allOf, someOf, success, failure, some, nothing, asyncSuccess} from '@ryandur/sand';

allOf([success(1), success(2), success(3)], (total, value) => success(total + value), success(0))
    .orNull(); // produces: 6

allOf([some(1), nothing(), some(3)], (total, value) => some(total + value), some(0))
    .orNull(); // produces: null (allOf needs every one)

someOf([success<number, string>(1), failure('x'), success(3)], (total, value) => success(total + value), success(0))
    .orNull(); // produces: 4 (someOf skips the failure)

await someOf([asyncSuccess<number, string>(1), asyncSuccess<number, string>(2)], (total, value) => asyncSuccess(total + value), asyncSuccess(0))
    .orNull(); // produces: 3
```

### tryCatch / asyncTryCatch

Both guard code that throws, folding the throw into the failure side so a chain never needs its own
try block. You say how a thrown `unknown` becomes your error type; `toError` is the everyday mapper.

```typescript
import {tryCatch, asyncTryCatch, toError} from '@ryandur/sand';

tryCatch(() => JSON.parse('{"name": "sand"}'), toError)
    .map(parsed => parsed.name)
    .orElse('unknown'); // produces: "sand"

tryCatch(() => JSON.parse('not json'), toError)
    .orElse('unknown'); // produces: "unknown" — the throw became a failure

await asyncTryCatch(() => fetch('/thing'), toError)
    .onFailure(explain)
    .orNull(); // guards the synchronous throw AND the rejection
```

## Maybe how you would like to use it.

Let's look at how we might use this lib. Imagine we are creating an
art [gallery](https://ryandur.github.io/ChosenPicachu/gallery?page=1&size=8&tab=aic), and we want to take a closer
look at one of the pieces. To get the piece of art we send a request to a backend referencing it by id. The response
might take a little while, so we need a way to notify the user that the request is pending. Once we have
obtained the piece we will need to display it, or if the call has failed we need to notify that something went wrong.

In the example below we request the art via ID. While we wait, we notify the user that the content is loading. The
***onPending*** function will fire the provided callback twice. Once when it is invoked and again once the call is done,
passing the pending state *(true then false)* as a parameter. Once the call is complete it will invoke either
***onSuccess*** with the data or ***onFailure*** with a possible explanation.

```typescript
getArt(id)
    .onPending(isLoading)
    .onSuccess(updatePiece)
    .onFailure(hasErrored);
```

To handle the request, we make a http ***GET*** to the endpoint with the id. We validate the response, if the response
is structured correctly pass back the successful response, else pass back a failure with some explanation.

```typescript
getArt: (id: string): Result.Async<Art, AnError> =>
    http.get(`/some-endpoint/${id}`)
        .mBind(response => maybe(valid(response))
            .map(asyncSuccess)
            .orElse(asyncFailure({type: Problem.CANNOT_DECODE, cause: response})))
```

To make the request, we fetch from the endpoint. If there is some kind of network error we give back an explanation. If
successful, we check the response status. Since it's a ***GET*** we expect a 200 is a successful response, or we
consider it a failure. Then we get the ***JSON*** out of the response. If there is a problem with the ***JSON*** we pack
it into an explanation.

```typescript
get: (endpoint: string): Result.Async<Art, AnError> =>
    asyncResult(fetch(endpoint))
        .or(err => asyncFailure({type: Problem.NETWORK_ERROR, cause: err}))
        .mBind(response => response.status === HTTPStatus.OK 
          ? asyncResult(response.json()) 
          : asyncFailure({type: Problem.NOT_OK, cause: response}));
```

## Examples of use

[Art Gallery](https://ryandur.github.io/ChosenPicachu/gallery?page=1&size=8&tab=aic)

* [Art](https://github.com/RyanDur/ChosenPicachu/blob/main/src/components/Gallery/Art/index.tsx#L19)
* [ArtPiece](https://github.com/RyanDur/ChosenPicachu/blob/main/src/components/Gallery/ArtPiece/index.tsx#L19)
* [handle request](https://github.com/RyanDur/ChosenPicachu/blob/main/src/data/artGallery/index.ts#L11)
* [make request](https://github.com/RyanDur/ChosenPicachu/blob/main/src/data/http.ts#L24)

## Resources

* [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)
* [Haskell Programming from First Principles](https://haskellbook.com/)
* [React Redux Starter - ../prelude](https://github.com/dam5s/react-redux-starter/tree/main/src/prelude)
