import {Result} from './types';
import {failure, success} from './result';
import {asyncFailure, asyncResult} from './asyncResult';

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
      asyncResult<VALUE, ERROR>(
        pending.catch((thrown: unknown) => Promise.reject(onError(thrown)))
      ),
    asyncFailure
  );
