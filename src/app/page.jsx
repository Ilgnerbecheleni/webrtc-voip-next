// app/page.jsx

"use client"

import { useEffect, useState, useRef } from "react"
import { iniciarPeer, getPeer } from "@/services/peerManager"
import { iniciarChamada, atenderChamada, encerrarChamada } from "@/services/callManager"
import { listarClientes, cadastrarCliente, excluirCliente, editarCliente } from "@/services/apiService"
import { Phone, PhoneOff, UserPlus, Users, Check, X } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import useSound from "use-sound"

export default function Home() {
  const [meuId, setMeuId] = useState("recepcao")
  const [chamadaDe, setChamadaDe] = useState(null)
  const [chamadaAtiva, setChamadaAtiva] = useState(false)
  const [conn, setConn] = useState(null)
  const [clientes, setClientes] = useState([])
  const [novoId, setNovoId] = useState("")
  const [novoNome, setNovoNome] = useState("")
  const [destino, setDestino] = useState("")
  const timeoutRef = useRef(null)
  const [playRing, { stop: stopRing }] = useSound("/toque-cliente.mp3", { volume: 1.0, loop: true })

  useEffect(() => {
    iniciarPeer(meuId).then((peer) => {
      peer.on("call", (chamada) => {
        console.log("📞 Recebendo chamada de", chamada.peer)
        setChamadaDe(chamada.peer)
        setConn(chamada)
        playRing()
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
      toast.error("Erro ao carregar clientes")
    }
  }

  const handleCadastrar = async (e) => {
    e.preventDefault()
    try {
      await cadastrarCliente(novoId, novoNome)
      toast.success("Cliente cadastrado!")
      setNovoId("")
      setNovoNome("")
      carregarClientes()
    } catch (error) {
      console.error("Erro ao cadastrar cliente", error)
      toast.error("Erro ao cadastrar cliente.")
    }
  }

  const handleChamar = async (idDestino) => {
    try {
      const idParaChamar = idDestino || destino
      if (!idParaChamar) {
        toast.error("Informe o ID do cliente.")
        return
      }

      const peer = getPeer()
      if (!peer) {
        toast.error("Peer ainda inicializando, aguarde...")
        return
      }

      console.log("📞 Iniciando chamada para", idParaChamar)
      await iniciarChamada(idParaChamar, setChamadaAtiva)
      toast("Chamando " + idParaChamar)

      timeoutRef.current = setTimeout(() => {
        console.log("⏰ Chamada não atendida, cancelando automaticamente.")
        handleEncerrar()
      }, 20000)
    } catch (error) {
      console.error("Erro ao iniciar chamada", error)
      toast.error("Erro ao iniciar chamada.")
    }
  }

  const handleAtender = () => {
    if (conn) {
      console.log("✅ Chamada atendida")
      atenderChamada(conn, setChamadaAtiva)
      stopRing()
      clearTimeout(timeoutRef.current)
      setChamadaDe(null)
      toast.success("Chamada atendida!")
    }
  }

  const handleRecusar = () => {
    if (conn) {
      console.log("❌ Chamada recusada")
      conn.close()
      stopRing()
      clearTimeout(timeoutRef.current)
      setConn(null)
      setChamadaDe(null)
      toast("Chamada recusada")
    }
  }

  const handleEncerrar = () => {
    console.log("🔚 Encerrando chamada")
    encerrarChamada(setChamadaAtiva)
    stopRing()
    clearTimeout(timeoutRef.current)
    setConn(null)
    setChamadaDe(null)
    toast("Chamada encerrada")
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <Toaster />
      <h1 className="text-3xl font-bold text-gray-800 mb-8 pb-2 border-b">Recepção - Gerenciar e Atender Clientes</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
            <Phone className="mr-2 h-6 w-6" /> Chamadas
          </h2>

          {chamadaDe && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-700 mb-3">Chamada recebida de {chamadaDe}</h3>
              <div className="flex space-x-3">
                <button onClick={handleAtender} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Check className="mr-2 h-4 w-4" /> Atender
                </button>
                <button onClick={handleRecusar} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <X className="mr-2 h-4 w-4" /> Recusar
                </button>
              </div>
            </div>
          )}

          {chamadaAtiva && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-medium text-green-700 mb-3">Chamada em andamento</h3>
              <button onClick={handleEncerrar} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                <PhoneOff className="mr-2 h-4 w-4" /> Encerrar Chamada
              </button>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Ligar para Cliente</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="text" placeholder="Digite ID do Cliente" value={destino} onChange={(e) => setDestino(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              <button onClick={() => handleChamar()} className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Phone className="mr-2 h-4 w-4" /> Ligar
              </button>
            </div>
          </div>
        </section>

        {/* Gerenciar Clientes */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
            <Users className="mr-2 h-6 w-6" /> Gerenciar Clientes
          </h2>

          <form onSubmit={handleCadastrar} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input type="text" placeholder="Novo ID" value={novoId} onChange={(e) => setNovoId(e.target.value)} required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Novo Nome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <UserPlus className="mr-2 h-5 w-5" /> Cadastrar
            </button>
          </form>

          <ul className="divide-y divide-gray-200">
            {clientes.map((cliente) => (
              <li key={cliente.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="font-medium text-gray-800">
                  <input type="text" value={cliente.nome} onChange={(e) => {
                    const novoNome = e.target.value
                    setClientes((prev) => prev.map((c) => c.id === cliente.id ? { ...c, nome: novoNome } : c))
                  }} className="border border-gray-300 px-2 py-1 rounded-md focus:ring-2 focus:ring-blue-500" />
                  <span className="text-gray-500 text-sm ml-2">({cliente.id})</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleChamar(cliente.id)} className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Phone className="w-5 h-5" />
                  </button>
                  <a href={`/cliente/${cliente.id}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                    Abrir
                  </a>
                  <button onClick={async () => {
                    await editarCliente(cliente.id, cliente.nome)
                    toast.success('Cliente atualizado')
                  }} className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700">
                    <Check className="w-5 h-5" />
                  </button>
                  <button onClick={async () => {
                    if (confirm(`Excluir cliente ${cliente.nome}?`)) {
                      await excluirCliente(cliente.id)
                      setClientes((prev) => prev.filter((c) => c.id !== cliente.id))
                      toast.success('Cliente excluído')
                    }
                  }} className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
