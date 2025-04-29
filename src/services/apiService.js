const API_URL = 'https://webrtc.jobsconnect.com.br';

export async function listarClientes() {
  const res = await fetch(`${API_URL}/clientes`);
  if (!res.ok) throw new Error('Erro ao buscar clientes');
  return await res.json();
}

export async function cadastrarCliente(id, nome) {
  const res = await fetch(`${API_URL}/cadastrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, nome })
  });
  if (!res.ok) throw new Error('Erro ao cadastrar');
  return await res.json();
}

export async function editarCliente(id, nome) {
  const res = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome })
  });
  if (!res.ok) throw new Error('Erro ao editar');
  return await res.json();
}

export async function excluirCliente(id) {
  const res = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Erro ao excluir');
  return await res.json();
}
