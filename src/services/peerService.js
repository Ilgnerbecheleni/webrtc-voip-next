// services/peerService.js
import Peer from 'peerjs';

let peer = null;

export const connectPeer = (id) => {
  peer = new Peer(id, {
    host: 'webrtc.jobsconnect.com.br', // troque para seu domínio!
    port: 3000,
    path: '/peerjs',
    secure: false, // se usar HTTPS, mude para true
  });

  return peer;
};

export const getPeer = () => peer;
