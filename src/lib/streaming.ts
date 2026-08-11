import {tryCatch} from './tryCatch';

export type Streaming<ERROR> = {
  onOpen: (greet: (socket: WebSocket) => void) => Streaming<ERROR>;
  onMessage: (receive: (event: MessageEvent) => void) => Streaming<ERROR>;
  onClose: (ended: () => void) => Streaming<ERROR>;
  onFailure: (handle: (error: ERROR) => void) => Streaming<ERROR>;
  close: () => void;
};

/**
 * ```ts
 * streaming('wss://example.test/live', () => 'unreachable')
 *     .onOpen(socket => socket.send(subscribe))
 *     .onMessage(receive)
 *     .onClose(mourn);
 * ```
 * streaming owns a socket's whole life: the handshake, the flow, the ending.
 * Message policy stays with the caller — frames arrive raw. Settled facts
 * replay for late listeners; the flow does not. close is the one teardown,
 * silent and idempotent: our own hanging up is not an ending worth announcing.
 */
export const streaming = <ERROR>(
  url: string | URL,
  onError: (thrown: unknown) => ERROR,
  protocols?: string | string[]
): Streaming<ERROR> => {
  const greets: ((socket: WebSocket) => void)[] = [];
  const receivers: ((event: MessageEvent) => void)[] = [];
  const endings: (() => void)[] = [];
  const failures: ((error: ERROR) => void)[] = [];
  let opened: WebSocket | undefined;
  let failed: {error: ERROR} | undefined;
  let ended = false;
  let torndown = false;

  const fail = (thrown: unknown) => {
    if (opened || failed || torndown) {
      return;
    }
    const error = onError(thrown);
    failed = {error};
    failures.forEach(handle => handle(error));
  };

  const end = () => {
    if (torndown) {
      return;
    }
    ended = true;
    endings.forEach(mourn => mourn());
  };

  const greet = (socket: WebSocket) => {
    if (torndown) {
      socket.close();
      return;
    }
    opened = socket;
    greets.forEach(welcome => welcome(socket));
  };

  const wire = (socket: WebSocket): WebSocket => {
    socket.addEventListener('open', () => greet(socket), {once: true});
    socket.addEventListener('error', fail);
    socket.addEventListener('close', event => opened ? end() : fail(event));
    socket.addEventListener('message', event => receivers.forEach(receive => receive(event)));
    return socket;
  };

  let socket: WebSocket | undefined;
  tryCatch(() => wire(new WebSocket(url, protocols)), onError).either(
    wired => {
      socket = wired;
    },
    error => {
      failed = {error};
    }
  );

  const stream: Streaming<ERROR> = {
    onOpen: welcome => {
      if (opened) {
        welcome(opened);
      }
      greets.push(welcome);
      return stream;
    },
    onMessage: receive => {
      receivers.push(receive);
      return stream;
    },
    onClose: mourn => {
      if (ended) {
        mourn();
      }
      endings.push(mourn);
      return stream;
    },
    onFailure: handle => {
      if (failed) {
        handle(failed.error);
      }
      failures.push(handle);
      return stream;
    },
    close: () => {
      torndown = true;
      socket?.close();
    }
  };

  return stream;
};
