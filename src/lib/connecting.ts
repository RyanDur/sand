import {Result} from './types';
import {asyncTryCatch} from './tryCatch';

/**
 * ```ts
 * connecting('wss://example.test/live', () => 'unreachable')
 *     .onSuccess(socket => socket.addEventListener('message', receive));
 * ```
 * connecting guards the handshake — the one exchange a socket settles. The
 * open connection comes back whole: message policy stays with the caller,
 * where it belongs. The chain owns the teardown: cancel closes the socket,
 * whether the handshake is still in flight or long since landed.
 */
export const connecting = <ERROR>(
  url: string | URL,
  onError: (thrown: unknown) => ERROR,
  protocols?: string | string[]
): Result.Async<WebSocket, ERROR> => {
  let socket: WebSocket | undefined;
  const handshake = asyncTryCatch(() => {
    const opening = new WebSocket(url, protocols);
    socket = opening;
    return new Promise<WebSocket>((resolve, reject) => {
      opening.addEventListener('open', () => resolve(opening), {once: true});
      opening.addEventListener('error', reject, {once: true});
      opening.addEventListener('close', reject, {once: true});
    });
  }, onError);
  return handshake.onCancel(() => socket?.close());
};
