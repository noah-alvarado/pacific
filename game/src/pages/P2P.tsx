import {
  Component,
  createEffect,
  createSignal,
  JSX,
  onCleanup,
  Setter,
} from "solid-js";
import { Controls } from "../components/Controls.jsx";
import { Board } from "../components/Board.jsx";
import { GameProvider, P2PGameConfig } from "../providers/Game.jsx";
import styles from "./Game.module.css";

interface P2PGameProps {
  gameConfig: P2PGameConfig;
}

const gameConfig = {
  gameType: "p2p",
  player: "red",
  turn: "red",
};

const P2PGame: Component<P2PGameProps> = (props) => {
  return (
    <GameProvider gameConfig={props.gameConfig}>
      <div class={styles.container}>
        <Controls />
        <Board />
      </div>
    </GameProvider>
  );
};

const P2P: Component = () => {
  // initialize connection with page load
  const [peerConnection, _setPeerConnection] =
    createSignal<RTCPeerConnection>(createConnection());
  // cleanup connection before updates
  const setPeerConnection: Setter<RTCPeerConnection> = (pc) => {
    cleanupConnection(peerConnection());
    _setPeerConnection(pc);
  };
  // cleanup connection when component unmounts
  onCleanup(() => {
    cleanupConnection(peerConnection());
  });

  function cleanupConnection(pc: RTCPeerConnection) {
    pc.getSenders().forEach((sender) => {
      sender.track?.stop();
    });

    pc.onnegotiationneeded = null;
    pc.onicecandidateerror = null;
    pc.onconnectionstatechange = null;
    pc.onsignalingstatechange = null;

    pc.close();
  }

  const [channel, setChannel] = createSignal<RTCDataChannel>(
    getDefaultChannel(peerConnection()),
  );

  let peerInput!: HTMLInputElement;
  let messageInput!: HTMLInputElement;

  function createConnection(): RTCPeerConnection {
    const connectionConfig: RTCConfiguration = {
      iceServers: [
        {
          urls: [
            `stun:stun.l.google.com:19302`,
            `stun:stunserver${new Date().getFullYear() - 1}.stunprotocol.org:3478`,
            `stun:stunserver${new Date().getFullYear()}.stunprotocol.org:3478`,
          ],
        },
      ],
    };
    const connection = new RTCPeerConnection(connectionConfig);
    connection.onnegotiationneeded = onnegotiationneeded;
    connection.onicecandidateerror = onicecandidateerror;
    connection.onconnectionstatechange = onconnectionstatechange;
    connection.onsignalingstatechange = onsignalingstatechange;
    return connection;
  }

  async function onnegotiationneeded(this: RTCPeerConnection, event: Event) {
    try {
      await this.setLocalDescription();
    } catch (err) {
      console.error("Error creating offer:", err);
    }
  }

  function onicecandidateerror(
    this: RTCPeerConnection,
    event: RTCPeerConnectionIceErrorEvent,
  ) {
    console.error("ICE Candidate error:", {
      errorCode: event.errorCode,
      errorText: event.errorText,
      url: event.url,
    });
  }

  function onconnectionstatechange(this: RTCPeerConnection, event: Event) {
    if (this.connectionState === "failed") {
      console.error("Connection state failed:", event);
    }
  }

  function onsignalingstatechange(this: RTCPeerConnection, event: Event) {
    if (this.signalingState === "closed") {
      console.error("Signaling state closed:", event);
    }
  }

  function getDefaultChannel(connection: RTCPeerConnection) {
    const channel: RTCDataChannel = connection.createDataChannel("chat", {
      negotiated: true,
      id: 0,
    });
    channel.onopen = () => {
      console.log("Data channel is open");
    };
    channel.onmessage = (message) => {
      console.log("message:", message);
    };
    channel.onerror = (error) => {
      console.error("Data channel error:", error);
    };
    return channel;
  }

  async function makeNewConnection() {
    const newConnection = createConnection();
    const prevRemote = peerConnection().remoteDescription;
    if (prevRemote) await newConnection.setRemoteDescription(prevRemote);
    setPeerConnection(newConnection);
    setChannel(getDefaultChannel(newConnection));
  }

  function createGame() {
    const offer = peerConnection().localDescription;
    console.log("shareable offer\n", JSON.stringify(offer));
  }

  async function acceptPeer() {
    const peerDescription = JSON.parse(peerInput.value);
    try {
      await peerConnection().setRemoteDescription(peerDescription);
    } catch (err) {
      console.error("Error setting remote description:", err);
    }
    if (peerDescription.type === "offer") {
      try {
        await peerConnection().setLocalDescription();
        console.log(
          "shareable answer\n",
          JSON.stringify(peerConnection().localDescription),
        );
      } catch (err) {
        console.error("Error creating answer:", err);
      }
    }
  }

  function sendMessage() {
    const message = messageInput.value;
    if (message) channel()?.send(message);
  }

  return (
    <>
      <h1>P2PGame</h1>

      <div>gameConfig: {JSON.stringify(gameConfig, null, 2)}</div>
      <br />

      <button onClick={createGame}>Create Game</button>
      <button onClick={makeNewConnection}>Make New Connection</button>
      <br />
      <br />

      <input ref={peerInput} type="text" placeholder="Enter your SDP peer" />
      <button onClick={acceptPeer}>Accept Peer</button>
      <br />
      <br />

      <input ref={messageInput} type="text" placeholder="Enter your message" />
      <button onClick={sendMessage}>Send Message</button>
      <br />
      <br />

      {/* <P2PGame gameConfig={gameConfig()} /> */}
    </>
  );
};

export default P2P;
