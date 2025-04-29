"use client"

import { useEffect, useState } from "react"
import { iniciarPeer } from "@/services/peerManager"
import { iniciarChamada, atenderChamada, encerrarChamada } from "@/services/callManager"
import { listarClientes, cadastrarCliente, excluirCliente , editarCliente } from "@/services/apiService"
import { Phone, PhoneOff, UserPlus, Users, Check, X } from "lucide-react"

export default function Home() {
  const [meuId, setMeuId] = useState("recepcao")
  const [chamadaDe, setChamadaDe] = useState(null)
  const [chamadaAtiva, setChamadaAtiva] = useState(false)
  const [conn, setConn] = useState(null)

  const [clientes, setClientes] = useState([])
  const [novoId, setNovoId] = useState("")
  const [novoNome, setNovoNome] = useState("")
  const [destino, setDestino] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [tipoMensagem, setTipoMensagem] = useState("")

  useEffect(() => {
    iniciarPeer(meuId).then((peer) => {
      peer.on("call", (chamada) => {
        setChamadaDe(chamada.peer)
        setConn(chamada)
      })
    })

    carregarClientes()
  }, [])

  const carregarClientes = async () => {
    try {
      const lista = await listarClientes()
      setClientes(lista)
    } catch (error) {
      console.error("Erro ao listar clientes", error)
      exibirMensagem("Erro ao carregar lista de clientes.", "erro")
    }
  }

  const exibirMensagem = (texto, tipo = "sucesso") => {
    setMensagem(texto)
    setTipoMensagem(tipo)
    setTimeout(() => {
      setMensagem("")
    }, 3000)
  }

  const handleCadastrar = async (e) => {
    e.preventDefault()
    try {
      await cadastrarCliente(novoId, novoNome)
      exibirMensagem("Cliente cadastrado com sucesso!", "sucesso")
      setNovoId("")
      setNovoNome("")
      carregarClientes()
    } catch (error) {
      console.error("Erro ao cadastrar cliente", error)
      exibirMensagem("Erro ao cadastrar cliente.", "erro")
    }
  }

  const handleChamar = () => {
    if (destino) {
      iniciarChamada(destino, setChamadaAtiva)
      exibirMensagem(`Iniciando chamada para ${destino}...`, "info")
    } else {
      exibirMensagem("Por favor, informe o ID do cliente.", "erro")
    }
  }

  const handleAtender = () => {
    if (conn) {
      atenderChamada(conn, setChamadaAtiva)
      setChamadaDe(null)
      exibirMensagem("Chamada atendida!", "sucesso")
    }
  }

  const handleRecusar = () => {
    if (conn) {
      conn.close()
      setConn(null)
      setChamadaDe(null)
      exibirMensagem("Chamada recusada.", "info")
    }
  }

  const handleEncerrar = () => {
    encerrarChamada(setChamadaAtiva)
    setConn(null)
    setChamadaDe(null)
    exibirMensagem("Chamada encerrada.", "info")
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 pb-2 border-b">Recepção - Gerenciar e Atender Clientes</h1>

      {mensagem && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            tipoMensagem === "erro"
              ? "bg-red-100 text-red-700"
              : tipoMensagem === "info"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
          }`}
        >
          {mensagem}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Área de Chamadas */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
            <Phone className="mr-2 h-6 w-6" />
            Chamadas
          </h2>

          {chamadaDe && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-700 mb-3">Chamada recebida de {chamadaDe}</h3>
              <div className="flex space-x-3">
                <button
                  onClick={handleAtender}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Atender
                </button>
                <button
                  onClick={handleRecusar}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="mr-2 h-4 w-4" />
                  Recusar
                </button>
              </div>
            </div>
          )}

          {chamadaAtiva && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-medium text-green-700 mb-3">Chamada em andamento</h3>
              <button
                onClick={handleEncerrar}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <PhoneOff className="mr-2 h-4 w-4" />
                Encerrar Chamada
              </button>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Ligar para Cliente</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Digite ID do Cliente"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                onClick={handleChamar}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Phone className="mr-2 h-4 w-4" />
                Ligar
              </button>
            </div>
          </div>
        </section>

        {/* Área de Gerenciamento de Clientes */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
            <Users className="mr-2 h-6 w-6" />
            Gerenciar Clientes
          </h2>

          <form onSubmit={handleCadastrar} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
              <UserPlus className="mr-2 h-5 w-5" />
              Cadastrar Novo Cliente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="Novo ID"
                value={novoId}
                onChange={(e) => setNovoId(e.target.value)}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Novo Nome"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Cadastrar Cliente
            </button>
          </form>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Lista de Clientes Cadastrados</h3>
            {clientes.length === 0 ? (
              <p className="text-gray-500 italic">Nenhum cliente cadastrado.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
              {clientes.map((cliente) => (
                <li
                  key={cliente.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="font-medium text-gray-800">
                    <input
                      type="text"
                      value={cliente.nome}
                      onChange={(e) => {
                        const novoNome = e.target.value;
                        setClientes((prev) =>
                          prev.map((c) =>
                            c.id === cliente.id ? { ...c, nome: novoNome } : c
                          )
                        );
                      }}
                      className="border border-gray-300 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-gray-500 text-sm">({cliente.id})</span>
                  </div>
            
                  <div className="flex gap-2">
                    {/* Botão Ligar */}
                    <button
                      onClick={() => {
                        setDestino(cliente.id);
                        iniciarChamada(cliente.id, setChamadaAtiva);
                        exibirMensagem(`Ligando para ${cliente.nome}...`, 'info');
                      }}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 animate-pulse transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
            
                    {/* Botão Abrir Página */}
                    <a
                      href={`/cliente/${cliente.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Abrir
                    </a>
            
                    {/* Botão Salvar Edição */}
                    <button
                      onClick={async () => {
                        try {
                          await editarCliente(cliente.id, cliente.nome);
                          exibirMensagem('Cliente atualizado com sucesso!', 'sucesso');
                        } catch (err) {
                          exibirMensagem('Erro ao atualizar cliente.', 'erro');
                        }
                      }}
                      className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-5 h-5" />
                    </button>
            
                    {/* Botão Excluir Cliente */}
                    <button
                      onClick={async () => {
                        if (confirm(`Deseja realmente excluir o cliente ${cliente.nome}?`)) {
                          try {
                            await excluirCliente(cliente.id);
                            exibirMensagem('Cliente excluído com sucesso!', 'info');
                            setClientes((prev) => prev.filter((c) => c.id !== cliente.id));
                          } catch (err) {
                            console.error('Erro ao excluir cliente', err);
                            exibirMensagem('Erro ao excluir cliente.', 'erro');
                          }
                        }
                      }}
                      className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
