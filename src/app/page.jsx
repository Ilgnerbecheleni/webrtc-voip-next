"use client"

import { useEffect, useState } from "react"
import { iniciarPeer, getPeer } from "@/services/peerManager" // <- adicionei getPeer aqui
import { iniciarChamada, atenderChamada, encerrarChamada } from "@/services/callManager"
import { listarClientes, cadastrarCliente, excluirCliente, editarCliente } from "@/services/apiService"
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

  const handleChamar = async () => {
    if (!destino) {
      exibirMensagem("Por favor, informe o ID do cliente.", "erro")
      return
    }

    try {
      const peer = getPeer()
      if (!peer) {
        exibirMensagem("Conexão ainda não inicializada, aguarde...", "erro")
        return
      }

      await iniciarChamada(destino, setChamadaAtiva)
      exibirMensagem(`Iniciando chamada para ${destino}...`, "info")
    } catch (error) {
      console.error("Erro ao iniciar chamada:", error)
      exibirMensagem("Erro ao iniciar chamada.", "erro")
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
        {/* ➡️ Você já montou corretamente essa parte abaixo com abrir, editar e excluir */}
      </div>
    </main>
  )
}
