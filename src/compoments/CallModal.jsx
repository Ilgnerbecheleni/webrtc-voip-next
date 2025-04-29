"use client";

export default function CallModal({ callerId, onAccept, onReject }) {
  return (
    <div style={{ background: '#0008', color: 'white', padding: 20, position: 'absolute', top: 50, left: '30%' }}>
      <h2>Chamada de {callerId}</h2>
      <button onClick={onAccept}>Atender</button>
      <button onClick={onReject}>Recusar</button>
    </div>
  );
}
