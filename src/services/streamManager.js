// services/streamManager.js

let localStream = null;

export const getLocalStream = async () => {
  if (!localStream) {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  }
  return localStream;
};

export const stopLocalStream = () => {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
};
