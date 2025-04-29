"use client";
import { useEffect, useState } from 'react';

export default function ClienteList({ onCall }) {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    fetch('https://webrtc.jobsconnect.com.br/clientes')

      .then(res => res.json())
      .then(data => setClientes(data));
  }, []);

  return (
    <ul>
      {clientes.map(cliente => (
        <li key={cliente.id}>
          {cliente.nome}
          <button onClick={() => onCall(cliente.id)}>Chamar</button>
        </li>
      ))}
    </ul>
  );
}
