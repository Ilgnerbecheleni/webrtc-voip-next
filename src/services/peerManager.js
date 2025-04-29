// services/peerManager.js
import Peer from 'peerjs';

let peer = null;

// 👇 Defina a URL do seu servidor de produção
const API_URL = 'webrtc.jobsconnect.com.br'; // sem https e sem barra no final!

export const iniciarPeer = async (meuId) => {
  const res = await fetch('https://webrtc.jobsconnect.com.br/token');
  const token = await res.json();

  peer = new Peer(meuId, {
    host: API_URL,       // <- Corrigido
    port: 443,
    secure: true,
    path: '/peerjs',
    config: {
      iceServers: [
        {
          urls: token.urls,
          username: token.username,
          credential: token.credential
        }
      ]
    }
  });

  return peer;
};

export const getPeer = () => peer;
