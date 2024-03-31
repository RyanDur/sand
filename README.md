# Sand

A library should support your decisions while allowing you to leave an impression for others to follow.

I made this little library of helper functions to aid my development of javascript/typescript applications and learn
more about the functional paradigm.

[Docs](https://ryandur.github.io/sand/modules.html)

![branches](./badges/coverage-branches.svg)  ![Functions](./badges/coverage-functions.svg)  ![lines](./badges/coverage-lines.svg)  ![statements](./badges/coverage-statements.svg)

## Maybe how you would like to use it.

Let's look at how we might use this lib. Imagine we are creating an
art [gallery](https://peaceful-heyrovsky-96583c.netlify.app/gallery?page=1&size=8&tab=aic), and we want to take a closer
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
        .or(err => asyncFailure({type: AnError.NETWORK_ERROR, cause: err}))
        .mBind(response => response.status === HTTPStatus.OK 
          ? asyncResult(response.json()) 
          : asyncFailure({type: Problem.NOT_OK, cause: response}));
```

## Examples of use

[Art Gallery](https://peaceful-heyrovsky-96583c.netlify.app/gallery?page=1&size=8&tab=aic)

* [Art](https://github.com/RyanDur/ChosenPicachu/blob/main/src/components/Gallery/Art/index.tsx#L19)
* [ArtPiece](https://github.com/RyanDur/ChosenPicachu/blob/main/src/components/Gallery/ArtPiece/index.tsx#L19)
* [handle request](https://github.com/RyanDur/ChosenPicachu/blob/main/src/data/artGallery/index.ts#L11)
* [make request](https://github.com/RyanDur/ChosenPicachu/blob/main/src/data/http.ts#L24)

## Resources

* [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)
* [Haskell Programming from First Principles](https://haskellbook.com/)
* [React Redux Starter - ../prelude](https://github.com/dam5s/react-redux-starter/tree/main/src/prelude)
