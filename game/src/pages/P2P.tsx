import { Component, createEffect, createSignal, Show } from "solid-js";
import { GameProvider, P2PGameConfig } from "../providers/Game.jsx";
import { useP2PConnection } from "../primitives/useP2PConnection.js";
import { Controls } from "../components/Controls.jsx";
import { Board } from "../components/Board.jsx";

import styles from "./Game.module.css";

const P2P: Component = () => {
  const p2p = useP2PConnection();

  const [p2pHandshake, setP2PHandshake] = createSignal<string>();
  const [gameConfig, setGameConfig] = createSignal<P2PGameConfig>();

  let peerInput!: HTMLInputElement;

  function createGame() {
    try {
      const offer = p2p.getOffer();
      setP2PHandshake(JSON.stringify(offer));
    } catch (e) {
      console.error("Error creating game:", e);
    }
  }

  async function acceptPeer() {
    if (!peerInput.value) return;
    try {
      const peer = JSON.parse(peerInput.value) as RTCSessionDescription;
      const answer = await p2p.acceptPeer(peer);
      if (answer) setP2PHandshake(JSON.stringify(answer));
    } catch (e) {
      console.error("Error joining game:", e);
    }
  }

  createEffect(() => {
    if (!p2p.ready()) return;

    setGameConfig({
      gameType: "p2p",
      player: p2p.player()!,
      turn: "red",
      sendGameEvent: p2p.sendGameEvent,
    });
  });

  return (
    <>
      <Show when={!p2p.ready()}>
        <h1>P2PGame</h1>

        <Show
          when={p2pHandshake()}
          fallback={<button onClick={createGame}>Create Game</button>}
        >
          <p>Share this code with your opponent:</p>
          <code>{p2pHandshake()}</code>
        </Show>
        <br />
        <br />

        <input
          ref={peerInput}
          type="text"
          placeholder="Enter your opponent's configuration here"
        />
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <button onClick={acceptPeer}>Accept Opponent</button>
        <br />
        <br />
        <br />
      </Show>

      <Show when={p2p.ready() && !gameConfig()}>
        <p>Starting game...</p>
      </Show>

      {gameConfig() && <P2PGame gameConfig={gameConfig()!} />}
    </>
  );
};

const P2PGame: Component<{ gameConfig: P2PGameConfig }> = (props) => {
  return (
    <GameProvider gameConfig={props.gameConfig}>
      <div class={styles.container}>
        <Controls />
        <Board />
      </div>
    </GameProvider>
  );
};

export default P2P;
