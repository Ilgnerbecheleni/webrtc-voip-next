// services/callManager.js
import { getLocalStream, stopLocalStream } from './streamManager';
import { getPeer } from './peerManager';

let chamadaAtual = null;
let verificarChamadaInterval = null;

export const iniciarChamada = async (destinoId, setStatusChamada) => {
  const peer = getPeer();
  const stream = await getLocalStream();

  const chamada = peer.call(destinoId, stream);
  chamadaAtual = chamada;

  chamada.on('stream', (remoteStream) => {
    const audio = new Audio();
    audio.srcObject = remoteStream;
    audio.play();
  });

  chamada.on('close', () => {
    encerrarChamada(setStatusChamada);
  });

  setStatusChamada(true);
  iniciarVerificacaoChamada(setStatusChamada);
};

export const atenderChamada = async (chamada, setStatusChamada) => {
  const stream = await getLocalStream();
  chamada.answer(stream);

  chamada.on('stream', (remoteStream) => {
    const audio = new Audio();
    audio.srcObject = remoteStream;
    audio.play();
  });

  chamada.on('close', () => {
    encerrarChamada(setStatusChamada);
  });

  chamadaAtual = chamada;
  setStatusChamada(true);
  iniciarVerificacaoChamada(setStatusChamada);
};

export const encerrarChamada = (setStatusChamada) => {
  if (chamadaAtual) {
    chamadaAtual.close();
    chamadaAtual = null;
  }
  stopLocalStream();
  setStatusChamada(false);
  if (verificarChamadaInterval) {
    clearInterval(verificarChamadaInterval);
    verificarChamadaInterval = null;
  }
};

function iniciarVerificacaoChamada(setStatusChamada) {
  if (verificarChamadaInterval) {
    clearInterval(verificarChamadaInterval);
  }

  verificarChamadaInterval = setInterval(() => {
    if (!chamadaAtual) {
      setStatusChamada(false);
      clearInterval(verificarChamadaInterval);
    } else {
      try {
        if (chamadaAtual.peerConnection) {
          const state = chamadaAtual.peerConnection.connectionState || chamadaAtual.peerConnection.iceConnectionState;
          if (state === 'closed' || state === 'failed' || state === 'disconnected') {
            encerrarChamada(setStatusChamada);
          }
        }
      } catch (err) {
        console.warn('Erro ao verificar estado da chamada:', err);
      }
    }
  }, 2000);
}
