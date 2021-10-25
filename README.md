# Sand

A library should support your decisions while allowing you to leave an impression for others to follow.

I made this little library of helper functions to aid my development of javascript/typescript applications and learn
more about the functional paradigm.

[Docs](https://ryandur.github.io/sand/modules.html)

![branches](./badges/coverage-branches.svg) ![Functions](./badges/coverage-functions.svg) ![lines](./badges/coverage-lines.svg) ![statements](./badges/coverage-statements.svg)

## Maybe how you would like to use it.

Let's look at how we might use this lib. Imagine we are creating an
art [gallery](https://peaceful-heyrovsky-96583c.netlify.app/gallery?page=1&size=8&tab=aic), and we want to take a closer
look at a piece of art. We would need to get the piece via its ID and send a request to a backend, so we can display it
on the page. The response might take a little while, so we will need a way to notify to the user that the request is
pending. Once we have obtained the piece we will need to display it, or if the call has failed we need to notify that
something went wrong.

In the example below we request the art via ID. While we wait we notify the user that the content is loading. The
*onPending* function will fire the provided callback twice. Once when it is invoked and again once the call is done
passing the pending state *(true then false)* as a parameter. Once the call is complete it will invoke either
*onSuccess* with te data or *onFailure* with a possible explanation.

```typescript
getArt(id)
    .onPending(isLoading)
    .onSuccess(updatePiece)
    .onFailure(hasErrored);
```

To handle the request, we make a http *GET* to the endpoint with the id. We validate the response, if the response is
structured correctly pass back the successful response, else pass back a failure with some explanation.

```typescript
getArt: (id: string): Result.Async<Art, Explanation<HTTPError>> =>
    http.get(`/some-endpoint/${id}`)
        .flatMap(response => maybe.of(valid(response))
            .map(asyncResult.success)
            .orElse(asyncResult.failure(explanation(HTTPError.CANNOT_DECODE))))
```

To make the request, we fetch from the endpoint. If there is some kind of network error we give back an explanation. If
successful, we check the response status. Since it's a *GET* we expect a 200 is a successful response, or we consider it
a failure. Then we get the *JSON* out of the response. If there is a problem with the *JSON* we pack it into an
explanation.

```typescript
get: (endpoint: string): Result.Async<Art, Explanation<HTTPError>> =>
    asyncResult.of(fetch(endpoint))
        .mapFailure(err => explanation(HTTPError.NETWORK_ERROR, maybe.some(err)))
        .flatMap(response => response.status === HTTPStatus.OK ?
            asyncResult.of(response.json()).mapFailure(
                err => explanation(HTTPError.JSON_BODY_ERROR, maybe.some(err))
            ) : fail(response));
```

## Examples of use

[Gallery implementation](https://github.com/RyanDur/ChosenPicachu/tree/main/src/lib/components/Gallery)

* [Art](https://github.com/RyanDur/ChosenPicachu/blob/main/src/lib/components/Gallery/Art/index.tsx#L19)
* [ArtPiece](https://github.com/RyanDur/ChosenPicachu/blob/main/src/lib/components/Gallery/ArtPiece/index.tsx#L19)
* [handle request](https://github.com/RyanDur/ChosenPicachu/blob/main/src/data/artGallery/index.ts#L11)
* [make request](https://github.com/RyanDur/ChosenPicachu/blob/main/src/data/http.ts#L24)

## Resources

* [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)
* [Haskell Programming from First Principles](https://haskellbook.com/)
* [React Redux Starter - ../prelude](https://github.com/dam5s/react-redux-starter/tree/main/src/prelude)