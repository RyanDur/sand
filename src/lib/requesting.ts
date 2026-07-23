import {Result} from './types';
import {asyncTryCatch} from './tryCatch';

export type RequestingInit = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown;
  headers?: Record<string, string>;
};

/**
 * ```ts
 * requesting('/things', {method: 'POST', body: {name: 'sand'}}, () => 'network error')
 *     .mBind(response => ...); // a body means stringify it and say it's JSON;
 *                              // status policy stays with the caller
 * ```
 * Cancelable end-to-end: bring no signal and requesting wires its own
 * AbortController through onCancel, so the chain's cancel aborts the exchange
 * at the network layer. Bring your own signal and it stays yours — cancel
 * only silences.
 */
export const requesting = <ERROR>(
  input: RequestInfo | URL,
  init: RequestingInit,
  onError: (thrown: unknown) => ERROR
): Result.Async<Response, ERROR> => {
  const abort = init.signal ? undefined : new AbortController();
  const wired = abort ? {...init, signal: abort.signal} : init;
  const exchange = asyncTryCatch(() => fetch(input, requestInit(wired)), onError);
  return abort ? exchange.onCancel(() => abort.abort()) : exchange;
};

const requestInit = ({body, headers, ...rest}: RequestingInit): RequestInit =>
  body === undefined
    ? {...rest, ...(headers ? {headers} : {})}
    : {
      ...rest,
      body: JSON.stringify(body),
      headers: {'Content-Type': 'application/json', ...headers}
    };
