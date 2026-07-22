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
 */
export const requesting = <ERROR>(
  input: RequestInfo | URL,
  init: RequestingInit,
  onError: (thrown: unknown) => ERROR
): Result.Async<Response, ERROR> =>
  asyncTryCatch(() => fetch(input, requestInit(init)), onError);

const requestInit = ({body, headers, ...rest}: RequestingInit): RequestInit =>
  body === undefined
    ? {...rest, ...(headers ? {headers} : {})}
    : {
      ...rest,
      body: JSON.stringify(body),
      headers: {'Content-Type': 'application/json', ...headers}
    };
