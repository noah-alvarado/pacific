import { fireEvent, waitFor } from "@solidjs/testing-library";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { INITIAL_PIECES } from "../constants/game.js";
import { renderWithProviders } from "../test/render.jsx";
import { PieceId } from "../types/GameState.js";

// Hoisted mock state so the vi.mock factory can reach it before our tests run.
const mocks = vi.hoisted(() => {
  type ActionListener = (data: unknown, peerId: string) => void;
  type PeerListener = (peerId: string) => void;

  interface MockRoom {
    sent: Record<string, unknown[]>;
    leave: ReturnType<typeof import("vitest").vi.fn>;
    actionListeners: Map<string, ActionListener>;
    peerJoinListeners: PeerListener[];
    peerLeaveListeners: PeerListener[];
    room: {
      makeAction: (
        action: string,
      ) => [(data: unknown) => Promise<void>, (cb: ActionListener) => void];
      onPeerJoin: (cb: PeerListener) => void;
      onPeerLeave: (cb: PeerListener) => void;
      leave: () => Promise<void>;
    };
  }

  function createMockRoom(): MockRoom {
    const sent: Record<string, unknown[]> = {};
    const actionListeners = new Map<string, ActionListener>();
    const peerJoinListeners: PeerListener[] = [];
    const peerLeaveListeners: PeerListener[] = [];
    const leave = vi.fn().mockResolvedValue(undefined);

    const room = {
      makeAction(action: string) {
        sent[action] = [];
        const send = (data: unknown) => {
          sent[action].push(data);
          return Promise.resolve();
        };
        const subscribe = (cb: ActionListener) => {
          actionListeners.set(action, cb);
        };
        return [send, subscribe] as [
          (data: unknown) => Promise<void>,
          (cb: ActionListener) => void,
        ];
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
      actionListeners,
      peerJoinListeners,
      peerLeaveListeners,
      room,
    };
  }

  const state = {
    rooms: [] as MockRoom[],
    joinCalls: [] as Array<{
      config: { appId: string; password: string };
      roomId: string;
      onError: (e: {
        error: string;
        appId: string;
        roomId: string;
        peerId: string;
      }) => void;
    }>,
    failNextSend: false,
    reset() {
      state.rooms = [];
      state.joinCalls = [];
      state.failNextSend = false;
    },
    last(): MockRoom | null {
      return state.rooms[state.rooms.length - 1] ?? null;
    },
  };

  return { state, createMockRoom };
});

vi.mock("trystero", () => ({
  joinRoom: vi.fn(
    (
      config: { appId: string; password: string },
      roomId: string,
      onError: (e: {
        error: string;
        appId: string;
        roomId: string;
        peerId: string;
      }) => void,
    ) => {
      const mock = mocks.createMockRoom();
      mocks.state.rooms.push(mock);
      mocks.state.joinCalls.push({ config, roomId, onError });
      return mock.room;
    },
  ),
}));

// Helpers ---------------------------------------------------------------

import Online from "./Online.jsx";

function emitFromPeer(action: string, data: unknown, peerId = "peer-1") {
  const m = mocks.state.last();
  m?.actionListeners.get(action)?.(data, peerId);
}

function triggerPeerJoin(peerId = "peer-1") {
  const m = mocks.state.last();
  m?.peerJoinListeners.forEach((cb) => cb(peerId));
}

function triggerPeerLeave(peerId = "peer-1") {
  const m = mocks.state.last();
  m?.peerLeaveListeners.forEach((cb) => cb(peerId));
}

const ROOM_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";

function stubCryptoFill(value = 0) {
  // Force generateRoomCode → first char of ROOM_CODE_ALPHABET ("A").
  vi.spyOn(crypto, "getRandomValues").mockImplementation(
    <T extends ArrayBufferView | null>(buf: T): T => {
      if (buf && "length" in (buf as unknown as { length: number })) {
        const arr = buf as unknown as { length: number; [i: number]: number };
        for (let i = 0; i < arr.length; i++) arr[i] = value;
      }
      return buf;
    },
  );
}

function fillJoinForm(
  result: ReturnType<typeof renderWithProviders>,
  roomId: string,
  password: string,
) {
  const idInput = result.getByTestId("room-id-input") as HTMLInputElement;
  const pwInput = result.getByTestId("room-password-input") as HTMLInputElement;
  fireEvent.input(idInput, { target: { value: roomId } });
  fireEvent.input(pwInput, { target: { value: password } });
}

const samplePiece = INITIAL_PIECES[PieceId.BluePlane1A];

// Tests ----------------------------------------------------------------

describe("<Online />", () => {
  beforeEach(() => {
    mocks.state.reset();
    vi.restoreAllMocks();
  });

  test("renders the join screen with title and inputs", () => {
    const result = renderWithProviders(Online, { withRouter: false });
    expect(result.getByText("Online")).toBeInTheDocument();
    expect(result.getByText("Join a Room")).toBeInTheDocument();
    expect(result.getByTestId("room-id-input")).toBeInTheDocument();
    expect(result.getByTestId("host-room")).toBeInTheDocument();
    expect(result.getByTestId("join-room")).toBeInTheDocument();
  });

  test("shows error when joining with empty fields", async () => {
    const result = renderWithProviders(Online, { withRouter: false });
    fireEvent.click(result.getByTestId("join-room"));

    const err = await result.findByTestId("join-error");
    expect(err.textContent).toContain("Room ID and code are required.");
    expect(mocks.state.joinCalls).toHaveLength(0);
  });

  test("Host New Room generates an 8-char id when room input is empty and 6-char password", () => {
    stubCryptoFill(0);
    const result = renderWithProviders(Online, { withRouter: false });

    fireEvent.click(result.getByTestId("host-room"));

    expect(mocks.state.joinCalls).toHaveLength(1);
    const call = mocks.state.joinCalls[0];
    expect(call.config.appId).toBe("pacific.alvarado.dev");
    // generated id length 8, password length 6
    expect(call.roomId).toHaveLength(8);
    expect(call.config.password).toHaveLength(6);
    // All chars are A (index 0 of alphabet) due to stub.
    expect(call.roomId).toBe("AAAAAAAA");
    expect(call.config.password).toBe("AAAAAA");
    // every char must be in alphabet
    for (const c of call.roomId + call.config.password) {
      expect(ROOM_CODE_ALPHABET).toContain(c);
    }

    // status row visible with the password and copy button
    expect(result.getByTestId("room-id").textContent).toBe("AAAAAAAA");
    expect(result.getByTestId("room-password").textContent).toBe("AAAAAA");
  });

  test("Host New Room uses provided room id when set", () => {
    stubCryptoFill(0);
    const result = renderWithProviders(Online, { withRouter: false });
    fillJoinForm(result, "my-room", "");
    fireEvent.click(result.getByTestId("host-room"));

    expect(mocks.state.joinCalls[0].roomId).toBe("my-room");
    expect(mocks.state.joinCalls[0].config.password).toHaveLength(6);
  });

  test("Join with valid inputs calls joinRoom with provided values", () => {
    const result = renderWithProviders(Online, { withRouter: false });
    fillJoinForm(result, "room-x", "code-x");
    fireEvent.click(result.getByTestId("join-room"));
    expect(mocks.state.joinCalls).toHaveLength(1);
    expect(mocks.state.joinCalls[0].roomId).toBe("room-x");
    expect(mocks.state.joinCalls[0].config.password).toBe("code-x");
  });

  test("negotiation: peer with lower draw → self plays blue and sends ready", async () => {
    // Self draw is 0.7, peer sends 0.1 → 0.1 < 0.7 → player="blue".
    vi.spyOn(Math, "random").mockReturnValue(0.7);
    const result = renderWithProviders(Online, { withRouter: false });
    fillJoinForm(result, "rm", "pw");
    fireEvent.click(result.getByTestId("join-room"));

    triggerPeerJoin();
    // After peer join, app sends a negotiation event.
    const sent = mocks.state.last()!.sent;
    expect(sent.gameEvent).toBeDefined();
    expect((sent.gameEvent as Array<{ eventType: string }>)[0].eventType).toBe(
      "negotiation",
    );

    emitFromPeer("gameEvent", { eventType: "negotiation", draw: 0.1 });

    // self should send a "ready" event after handling negotiation
    await waitFor(() => {
      const events = sent.gameEvent as Array<{ eventType: string }>;
      expect(events.some((e) => e.eventType === "ready")).toBe(true);
    });

    // Now peer sends ready — game should mount.
    emitFromPeer("gameEvent", { eventType: "ready" });
    await waitFor(() => {
      const game = result.getByTestId("game");
      expect(game.getAttribute("data-player")).toBe("blue");
    });
  });

  test("negotiation: peer with higher draw → self plays red", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    const result = renderWithProviders(Online, { withRouter: false });
    fillJoinForm(result, "rm", "pw");
    fireEvent.click(result.getByTestId("join-room"));

    triggerPeerJoin();
    emitFromPeer("gameEvent", { eventType: "negotiation", draw: 0.9 });
    emitFromPeer("gameEvent", { eventType: "ready" });

    await waitFor(() => {
      const game = result.getByTestId("game");
      expect(game.getAttribute("data-player")).toBe("red");
    });
  });

  test("invalid game event payload triggers console.warn", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = renderWithProviders(Online, { withRouter: false });
    fillJoinForm(result, "rm", "pw");
    fireEvent.click(result.getByTestId("join-room"));

    emitFromPeer("gameEvent", { not: "valid" });
    expect(warn).toHaveBeenCalled();
  });

  test("remote turnChange/moveMade/gameEnd update the game and dedupe forwards", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const result = renderWithProviders(Online, { withRouter: false });
    fillJoinForm(result, "rm", "pw");
    fireEvent.click(result.getByTestId("join-room"));

    triggerPeerJoin();
    emitFromPeer("gameEvent", { eventType: "negotiation", draw: 0.1 });
    emitFromPeer("gameEvent", { eventType: "ready" });

    const sent = mocks.state.last()!.sent;
    await waitFor(() => result.getByTestId("game"));
    const game = result.getByTestId("game");
    // Initial turn=blue
    expect(game.getAttribute("data-turn")).toBe("blue");

    const sentGameEventsBefore = (
      sent.gameEvent as Array<{ eventType: string }>
    ).length;

    // Drive a remote turnChange to red.
    emitFromPeer("gameEvent", {
      eventType: "turnChange",
      from: "blue",
      to: "red",
    });

    await waitFor(() => expect(game.getAttribute("data-turn")).toBe("red"));

    // Forward dedupe: no new gameEvent should have been sent for the
    // remote turnChange.
    const events = sent.gameEvent as Array<{ eventType: string }>;
    const newTurnChanges = events
      .slice(sentGameEventsBefore)
      .filter((e) => e.eventType === "turnChange");
    expect(newTurnChanges).toHaveLength(0);

    // moveMade — drive a remote move and ensure no console error.
    emitFromPeer("gameEvent", {
      eventType: "moveMade",
      moveType: "move",
      piece: samplePiece,
      from: samplePiece.position,
      to: { x: samplePiece.position.x, y: samplePiece.position.y + 1 },
    });

    // gameEnd — should flip phase to finished.
    emitFromPeer("gameEvent", {
      eventType: "gameEnd",
      winner: "blue",
      loser: "red",
      reason: "no-planes",
    });

    await waitFor(() =>
      expect(game.getAttribute("data-phase")).toBe("finished"),
    );

    // gameEnd forwarder must also have skipped re-broadcasting.
    const after = sent.gameEvent as Array<{ eventType: string }>;
    const newGameEnds = after
      .slice(sentGameEventsBefore)
      .filter((e) => e.eventType === "gameEnd");
    expect(newGameEnds).toHaveLength(0);
  });

  test("chat: handleSendMessage appends a self message and onChatMessage appends a peer message", async () => {
    const result = renderWithProviders(Online, { withRouter: false });
    fillJoinForm(result, "rm", "pw");
    fireEvent.click(result.getByTestId("join-room"));

    triggerPeerJoin();

    // Chat input is now visible (connectionReady = true after peer join).
    const chatInput = await waitFor(() => {
      const el = result.container.querySelector(
        'input[placeholder="Type a message..."]',
      ) as HTMLInputElement | null;
      if (!el) throw new Error("chat input not yet rendered");
      return el;
    });

    fireEvent.input(chatInput, { target: { value: "hello" } });
    const sendBtn = result.getByText("Send");
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(result.getByText(/\[self\] hello/)).toBeInTheDocument();
    });
    const m = mocks.state.last()!;
    expect((m.sent.chatMessage as string[])[0]).toBe("hello");

    // Empty message should be a no-op.
    fireEvent.input(chatInput, { target: { value: "" } });
    fireEvent.click(sendBtn);
    expect((m.sent.chatMessage as string[]).length).toBe(1);

    // Remote chat appears with sender id.
    emitFromPeer("chatMessage", "hi back", "peer-1");
    await waitFor(() => {
      expect(result.getByText(/\[peer-1\] hi back/)).toBeInTheDocument();
    });
  });

  test("Leave Room clears state and shows the join form again", async () => {
    const result = renderWithProviders(Online, { withRouter: false });
    fillJoinForm(result, "rm", "pw");
    fireEvent.click(result.getByTestId("join-room"));

    expect(result.getByTestId("leave-room")).toBeInTheDocument();
    fireEvent.click(result.getByTestId("leave-room"));

    await waitFor(() => {
      expect(result.getByText("Join a Room")).toBeInTheDocument();
    });
  });

  test("Copy button writes password to clipboard", async () => {
    stubCryptoFill(0);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    const result = renderWithProviders(Online, { withRouter: false });
    fireEvent.click(result.getByTestId("host-room"));

    const copyBtn = result.getByText("Copy");
    fireEvent.click(copyBtn);

    expect(writeText).toHaveBeenCalledWith("AAAAAA");
  });

  test("Copy with rejected clipboard logs error", async () => {
    stubCryptoFill(0);
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    const result = renderWithProviders(Online, { withRouter: false });
    fireEvent.click(result.getByTestId("host-room"));
    fireEvent.click(result.getByText("Copy"));

    await waitFor(() => expect(err).toHaveBeenCalled());
  });

  test("onPeerLeave resets readiness and removes the peer", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const result = renderWithProviders(Online, { withRouter: false });
    fillJoinForm(result, "rm", "pw");
    fireEvent.click(result.getByTestId("join-room"));

    triggerPeerJoin();
    emitFromPeer("gameEvent", { eventType: "negotiation", draw: 0.1 });
    emitFromPeer("gameEvent", { eventType: "ready" });

    await waitFor(() => result.getByTestId("game"));

    triggerPeerLeave();

    await waitFor(() => {
      const peers = result.getByTestId("peers");
      expect(peers.getAttribute("data-peer-count")).toBe("0");
    });
  });

  test("onJoinError surfaces the error in the DOM", async () => {
    const result = renderWithProviders(Online, { withRouter: false });
    fillJoinForm(result, "rm", "pw");
    fireEvent.click(result.getByTestId("join-room"));

    // Simulate trystero invoking the error callback.
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const call = mocks.state.joinCalls[0];
    call.onError({
      error: "boom",
      appId: "pacific.alvarado.dev",
      roomId: "rm",
      peerId: "?",
    });

    // joinError is only rendered on the join screen — leave first.
    fireEvent.click(result.getByTestId("leave-room"));
    await waitFor(() => {
      expect(result.getByTestId("join-error").textContent).toContain("boom");
    });
    expect(errorSpy).toHaveBeenCalled();
  });
});
