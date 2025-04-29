"use client";

import { useEffect, useState } from 'react';
import { listarClientes } from '@/services/apiService';

export default function ListaClientes({ recarregar }) {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    async function carregar() {
      const lista = await listarClientes();
      setClientes(lista);
    }
    carregar();
  }, [recarregar]); // Atualiza quando recarregar muda

  return (
    <div>
      <h2>Lista de Clientes</h2>
      <ul>
        {clientes.map((cliente) => (
          <li key={cliente.id}>
            {cliente.nome} ({cliente.id})
          </li>
        ))}
      </ul>
    </div>
  );
}
