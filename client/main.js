const WS_URL = "wss://NAMAWORKER.username.workers.dev"; // GANTI

const socket = new WebSocket(WS_URL);

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const startBtn = document.getElementById("start");

let pc;
let localStream;

const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

socket.onmessage = async (event) => {
  const msg = JSON.parse(event.data);

  if (msg.offer) {
    await pc.setRemoteDescription(msg.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.send(JSON.stringify({ answer }));
  }

  if (msg.answer) {
    await pc.setRemoteDescription(msg.answer);
  }

  if (msg.ice) {
    await pc.addIceCandidate(msg.ice);
  }
};

startBtn.onclick = async () => {
  pc = new RTCPeerConnection(config);

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.send(JSON.stringify({ ice: e.candidate }));
    }
  };

  pc.ontrack = (e) => {
    remoteVideo.srcObject = e.streams[0];
  };

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localVideo.srcObject = localStream;

  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.send(JSON.stringify({ offer }));
};
