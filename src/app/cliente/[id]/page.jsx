"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { iniciarPeer } from "@/services/peerManager";
import { iniciarChamada, atenderChamada, encerrarChamada } from "@/services/callManager";
import ReactHowler from "react-howler";
import { Phone, PhoneCall, PhoneOff, Check, X } from "lucide-react";

export default function ClientePage() {
  const { id } = useParams();
  const [clienteValido, setClienteValido] = useState(null);
  const [nomeCliente, setNomeCliente] = useState(""); // <-- aqui
  const [chamadaDe, setChamadaDe] = useState(null);
  const [chamadaAtiva, setChamadaAtiva] = useState(false);
  const [conn, setConn] = useState(null);
  const [tocandoToque, setTocandoToque] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");

  useEffect(() => {
    const validarCliente = async () => {
      try {
        const res = await fetch('https://webrtc.jobsconnect.com.br/clientes');
        const lista = await res.json();
        const cliente = lista.find((c) => c.id === id);
        if (cliente) {
          setClienteValido(true);
          setNomeCliente(cliente.nome); // <-- aqui pega o nome
        } else {
          setClienteValido(false);
        }
      } catch (error) {
        console.error("Erro ao validar cliente:", error);
        setClienteValido(false);
      }
    };

    if (id) validarCliente();
  }, [id]);

  useEffect(() => {
    if (id && clienteValido) {
      iniciarPeer(id).then((peer) => {
        peer.on("call", (chamada) => {
          setChamadaDe(chamada.peer);
          setConn(chamada);
          setTocandoToque(true);
          exibirMensagem("Chamada recebida da Recepção!", "info");
        });
      });
    }
  }, [id, clienteValido]);

  const exibirMensagem = (texto, tipo = "sucesso") => {
    setMensagem(texto);
    setTipoMensagem(tipo);
    setTimeout(() => {
      setMensagem("");
    }, 3000);
  };

  const handleAtender = async () => {
    if (conn) {
      setTocandoToque(false);
      await atenderChamada(conn, setChamadaAtiva);
      setChamadaDe(null);
      exibirMensagem("Chamada atendida!", "sucesso");
    }
  };

  const handleRecusar = async () => {
    if (conn) {
      setTocandoToque(false);
      conn.close();
      setConn(null);
      setChamadaDe(null);
      exibirMensagem("Chamada recusada.", "info");
    }
  };

  const handleChamarRecepcao = () => {
    iniciarChamada("recepcao", setChamadaAtiva);
    exibirMensagem("Ligando para a recepção...", "info");
  };

  const handleEncerrar = () => {
    setTocandoToque(false);
    encerrarChamada(setChamadaAtiva);
    setConn(null);
    setChamadaDe(null);
    exibirMensagem("Chamada encerrada.", "info");
  };

  if (clienteValido === false) {
    return (
      <main className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Cliente não encontrado</h1>
        <p className="text-gray-600">Verifique o link ou entre em contato com a recepção.</p>
      </main>
    );
  }

  if (clienteValido === null) {
    return (
      <main className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <p className="text-gray-500">Verificando cliente...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b flex items-center">
          <PhoneCall className="mr-3 h-7 w-7 text-blue-600" />
          {nomeCliente} <span className="text-blue-600 ml-2 text-lg">({id})</span>
        </h1>

        {/* 🔔 Toque da chamada */}
        <ReactHowler src="/toque-cliente.mp3" playing={tocandoToque} loop={true} volume={1.0} />

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

        {chamadaDe && (
          <div className="mb-6 p-5 bg-yellow-50 border border-yellow-200 rounded-lg animate-pulse">
            <h2 className="text-xl font-semibold text-yellow-700 mb-4">Chamada recebida da Recepção</h2>
            <div className="flex space-x-4">
              <button
                onClick={handleAtender}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="mr-2 h-5 w-5" />
                Atender
              </button>
              <button
                onClick={handleRecusar}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="mr-2 h-5 w-5" />
                Recusar
              </button>
            </div>
          </div>
        )}

        {chamadaAtiva && (
          <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-xl font-semibold text-green-700 mb-4">Chamada em andamento</h2>
            <div className="flex justify-center">
              <button
                onClick={handleEncerrar}
                className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <PhoneOff className="mr-2 h-5 w-5" />
                Encerrar Chamada
              </button>
            </div>
          </div>
        )}

        {!chamadaDe && !chamadaAtiva && (
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Precisa de ajuda?</h2>
            <div className="flex justify-center">
              <button
                onClick={handleChamarRecepcao}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Phone className="mr-2 h-5 w-5" />
                Ligar para Recepção
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Este é o seu terminal de atendimento pessoal.</p>
          <p>Você pode ligar para a recepção a qualquer momento para obter assistência.</p>
        </div>
      </div>
    </main>
  );
}
