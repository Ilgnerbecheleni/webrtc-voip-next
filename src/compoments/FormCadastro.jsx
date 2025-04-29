"use client";

import { useState } from 'react';
import { cadastrarCliente } from '@/services/apiService';

export default function FormCadastro({ onSuccess }) {
  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await cadastrarCliente(id, nome);
      setMensagem('Usuário cadastrado com sucesso!');
      setId('');
      setNome('');
      onSuccess(); // recarrega a lista
    } catch (error) {
      setMensagem('Erro ao cadastrar usuário.');
      console.error(error);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>Cadastrar Novo Cliente</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="ID do cliente"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
          style={{ marginRight: '10px' }}
        />
        <input
          type="text"
          placeholder="Nome do cliente"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          style={{ marginRight: '10px' }}
        />
        <button type="submit">Cadastrar</button>
      </form>
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
}
