import { vi } from "vitest";

type ActionListener = (data: unknown, peerId: string) => void;
type PeerListener = (peerId: string) => void;

export interface MockRoom {
  /** Emit a message coming from a remote peer for the given action. */
  emitFromPeer: (action: string, data: unknown, peerId?: string) => void;
  /** Trigger the onPeerJoin handler. */
  triggerPeerJoin: (peerId?: string) => void;
  /** Trigger the onPeerLeave handler. */
  triggerPeerLeave: (peerId?: string) => void;
  /** Recorded sent messages keyed by action name. */
  sent: Record<string, unknown[]>;
  /** Spy on `leave()`. */
  leave: ReturnType<typeof vi.fn>;
  /** Underlying trystero-shaped room. */
  room: {
    makeAction: (
      action: string,
    ) => [(data: unknown) => Promise<void>, (cb: ActionListener) => void];
    onPeerJoin: (cb: PeerListener) => void;
    onPeerLeave: (cb: PeerListener) => void;
    leave: () => Promise<void>;
  };
}

/**
 * Build a fake trystero Room compatible with Online.tsx's usage. The returned
 * object exposes hooks for tests to drive remote events and inspect sends.
 */
export function createMockRoom(): MockRoom {
  const actionListeners = new Map<string, ActionListener>();
  const peerJoinListeners: PeerListener[] = [];
  const peerLeaveListeners: PeerListener[] = [];
  const sent: Record<string, unknown[]> = {};
  const leave = vi.fn().mockResolvedValue(undefined);

  const room = {
    makeAction(
      action: string,
    ): [(data: unknown) => Promise<void>, (cb: ActionListener) => void] {
      sent[action] = [];
      const send = (data: unknown) => {
        sent[action].push(data);
        return Promise.resolve();
      };
      const subscribe = (cb: ActionListener) => {
        actionListeners.set(action, cb);
      };
      return [send, subscribe];
    },
    onPeerJoin(cb: PeerListener) {
      peerJoinListeners.push(cb);
    },
    onPeerLeave(cb: PeerListener) {
      peerLeaveListeners.push(cb);
    },
    leave,
  };

  return {
    sent,
    leave,
    room,
    emitFromPeer(action, data, peerId = "peer-1") {
      actionListeners.get(action)?.(data, peerId);
    },
    triggerPeerJoin(peerId = "peer-1") {
      peerJoinListeners.forEach((cb) => cb(peerId));
    },
    triggerPeerLeave(peerId = "peer-1") {
      peerLeaveListeners.forEach((cb) => cb(peerId));
    },
  };
}

interface InstallOptions {
  /** Optional pre-built mock room. If omitted, one is created on join. */
  mockRoom?: MockRoom;
  /** Invoked when joinRoom is called; useful for asserting args. */
  onJoin?: (
    config: { appId: string; password: string },
    roomId: string,
  ) => void;
  /** Synchronous handler invoked when the joinRoom error callback fires. */
}

/**
 * Install the trystero mock with `vi.mock`. Must be called from a test file's
 * top level (vitest hoists vi.mock). Returns the mock controller.
 *
 * Usage:
 *   const trystero = installTrysteroMock();
 *   trystero.lastMockRoom?.triggerPeerJoin();
 */
export function installTrysteroMock(options: InstallOptions = {}) {
  const controller = {
    lastMockRoom: options.mockRoom ?? null,
    joinCalls: [] as Array<{
      config: { appId: string; password: string };
      roomId: string;
    }>,
    /** Replace the room returned by the next joinRoom call. */
    setNextRoom(mock: MockRoom) {
      controller.lastMockRoom = mock;
    },
  };

  vi.mock("trystero", () => ({
    joinRoom: vi.fn(
      (config: { appId: string; password: string }, roomId: string) => {
        controller.joinCalls.push({ config, roomId });
        options.onJoin?.(config, roomId);
        const mock = controller.lastMockRoom ?? createMockRoom();
        controller.lastMockRoom = mock;
        return mock.room;
      },
    ),
  }));

  return controller;
}
