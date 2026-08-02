import {Maybe, Result} from './types';
import {failure, success} from './result';
import {asyncFailure, asyncResult} from './asyncResult';
import {maybe, nothing} from './maybe';

/**
 * ```ts
 * tryCatch(() => JSON.parse(raw), toError)
 *     .map(parsed => parsed.name)
 *     .orElse('unknown'); // a throwing parse becomes a failure, never an exception
 * ```
 */
export const tryCatch = <VALUE, ERROR>(
  fn: () => VALUE,
  onError: (thrown: unknown) => ERROR
): Result<VALUE, ERROR> => {
  try {
    return success(fn());
  } catch (thrown) {
    return failure(onError(thrown));
  }
};

/**
 * ```ts
 * attempt(() => JSON.parse(frame))
 *     .mBind(json => maybe(TradeDecoder.decode(json))); // a throw is just nothing — for edges where absence is the only fact
 * ```
 */
export const attempt = <VALUE>(fn: () => VALUE): Maybe<VALUE> =>
  tryCatch(fn, nothing).either(maybe, absent => absent);

/**
 * ```ts
 * asyncTryCatch(() => navigator.clipboard.writeText(text), toError)
 *     .onFailure(explain); // guards the synchronous throw AND the rejection
 * ```
 */
export const asyncTryCatch = <VALUE, ERROR>(
  fn: () => Promise<VALUE>,
  onError: (thrown: unknown) => ERROR
): Result.Async<VALUE, ERROR> =>
  tryCatch(fn, onError).either(
    pending =>
      asyncResult<VALUE, ERROR>(pending.catch((thrown: unknown) => Promise.reject(onError(thrown)))),
    asyncFailure
  );
