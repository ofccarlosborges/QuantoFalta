import React, { useState, useEffect } from "react";
import { Text, Image } from "react-native";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Lottie from "lottie-react";
import animationIncomplete from "./src/animationIncomplete.json";
import animationComplete from "./src/animationComplete.json";
import catSad from "./src/catSad.json";
import morte from "./src/morte.json";
import { Link } from "expo-router";
import qrCode from "./src/qrCode.jpg";

import AntDesign from '@expo/vector-icons/AntDesign';


const atividadesOptions = [
  { nome: "Participação em projetos institucionais", tipo: "variavel", limiteIndividual: 0.25, limiteTotal: 0.75, icone: "🏛️", tooltip: "25% do total por ano (máximo de 3 anos). Limite total: 75%." },
  { nome: "Publicação de artigo científico", tipo: "fixo", carga: 25, limiteTotal: Infinity, icone: "📄", tooltip: "25 horas por publicação. Sem limite total." },
  { nome: "Participação em eventos técnicos", tipo: "variavel", limiteIndividual: 10, limiteTotal: 0.40, icone: "🎤", tooltip: "Até 10 horas por evento. Limite total: 40%." },
  { nome: "Participação em eventos técnicos com apresentação", tipo: "fixo", carga: 20, limiteTotal: Infinity, icone: "🎤📢", tooltip: "20 horas por evento. Sem limite total." },
  { nome: "Estágio não obrigatório", tipo: "variavel", limiteIndividual: 0.25, limiteTotal: 0.75, icone: "💼", tooltip: "25% do total por ano (máximo de 3 anos). Limite total: 75%." },
  { nome: "Representação Estudantil nos Conselhos", tipo: "fixo", carga: 10, limiteTotal: 30, icone: "👥", tooltip: "10 horas por ano. Limite total: 30 horas." },
  { nome: "Participação Estudantil em Diretório Central e Acadêmico", tipo: "fixo", carga: 10, limiteTotal: 30, icone: "👥🏢", tooltip: "10 horas por ano. Limite total: 30 horas." },
  { nome: "Participação em Empresa Júnior", tipo: "fixo", carga: 30, limiteTotal: 90, icone: "🏢", tooltip: "30 horas por ano. Limite total: 90 horas." },
  { nome: "Outras Atividades reconhecidas", tipo: "variavel", limiteTotal: 0.65, icone: "📝", tooltip: "Sem limite individual. Limite total: 65%." },
];

interface Atividade {
  nome: string;
  tipo: string;
  carga: number;
  limiteIndividual?: number;
  limiteTotal: number;
  icone?: string;
  tooltip?: string;
}

export default function AtividadesComplementares() {
  const [cargaTotal, setCargaTotal] = useState(0);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState(atividadesOptions[0]);
  const [cargaEvento, setCargaEvento] = useState(0);
  const [quantidadeAtividade, setQuantidadeAtividade] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const savedAtividades = localStorage.getItem("atividades");
    if (savedAtividades) {
      try {
        setAtividades(JSON.parse(savedAtividades) || []);
      } catch (error) {
        console.error("Erro ao carregar atividades do LocalStorage", error);
        setAtividades([]);
      }
    }
  }, []);


  useEffect(() => {
    localStorage.setItem("atividades", JSON.stringify(atividades));
  }, [atividades]);

  const adicionarAtividade = () => {
    if (!cargaTotal) {
      toast.error("Por favor, insira a carga horária total necessária.");
      return;
    }

    const cargaAtual = atividades
      .filter(atv => atv.nome === atividadeSelecionada.nome)
      .reduce((acc, atv) => acc + atv.carga, 0);

    let limiteTotalCalculado = atividadeSelecionada.limiteTotal * cargaTotal;
    let limiteIndividualCalculado = atividadeSelecionada.limiteIndividual ? atividadeSelecionada.limiteIndividual * cargaTotal : Infinity;

    if (cargaAtual >= limiteTotalCalculado) {
      toast.error(`Carga horária máxima (${limiteTotalCalculado}h) já foi atingida para esta atividade.`);
      return;
    }

    let totalCarga = 0;
    if (atividadeSelecionada.tipo === "fixo") {
      const cargaFixa = atividadeSelecionada.carga || 0;
      totalCarga = Math.min(cargaFixa * quantidadeAtividade, limiteTotalCalculado - cargaAtual);
      if (cargaAtual + totalCarga > atividadeSelecionada.limiteTotal) {
        totalCarga = atividadeSelecionada.limiteTotal - cargaAtual;
      }
    } else if (atividadeSelecionada.tipo === "variavel") {
      totalCarga = Math.min(cargaEvento, limiteIndividualCalculado, limiteTotalCalculado - cargaAtual);
    }

    if (totalCarga <= 0 || isNaN(totalCarga)) {
      toast.error(`Carga horária máxima (${atividadeSelecionada.limiteTotal}h) já foi atingida para esta atividade.`);
      return;
    }

    setAtividades([...atividades, { ...atividadeSelecionada, carga: totalCarga }]);
    setQuantidadeAtividade(1);
    setCargaEvento(0);
    toast.success("Atividade adicionada com sucesso!");
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };


  const removerAtividade = (index: number) => {
    setAtividades(atividades.filter((_, i) => i !== index));
    toast.info("Atividade removida.");
  };

  const cargaCumprida = atividades.reduce((acc, atv) => acc + atv.carga, 0);
  //const porcentagemCumprida = cargaTotal > 0 ? ((cargaCumprida / cargaTotal) * 100).toFixed(2) : "0";
  const porcentagemCumprida = cargaTotal > 0 ? Math.min((cargaCumprida / cargaTotal) * 100, 100) : 0;


  return (
    <div className="min-h-screen bg-white flex flex-col overflow-auto">

      <header>
        <nav className="border-b border-gray-200 shadow-md shadow-gray-200 px-6 py-3">
          <div className="flex justify-between items-center max-w-screen-xl mx-auto">

            {/*Título */}
            <h1 className="text-2xl text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-600">
              Quanto Falta?
            </h1>

            {/* Links de navegação */}
            <ul className="flex space-x-6">
              <li>
                <Link href="/" asChild>
                  <Text className="text-gray-800 font-semibold text-lg transition-colors hover:text-blue-600">
                    Atividade Complementar
                  </Text>
                </Link>
              </li>
              <li>
                <Link href="/finalUEFS" asChild>
                  <Text className="text-gray-800 font-semibold text-lg transition-colors hover:text-blue-600">
                    Cálculo Final
                  </Text>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      <ToastContainer />
      <main className="flex-1 container mx-auto p-8 mt-7 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex-col  mb-8">
            <h1 className="text-4xl font-extrabold text-center text-gray-500">
              Cálculo de
            </h1>
            <h1 className="text-4xl text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-600 mb-5">
              Atividades Complementares
            </h1>

            <p className="text-center text-gray-700 mt-2 font-bold">
              Não precisa esperar pelo dia do juízo final onde o colegiado vai receber seus certificados e dar sua sentença. Facilitamos para que você possa ir acompanhando
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Formulário de cadastro */}
            <div className="bg-white p-8 rounded-xl border border-gray-300">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Carga Horária Total Necessária:
                </label>
                <input
                  type="number"
                  value={cargaTotal}
                  onChange={(e) => setCargaTotal(Number(e.target.value))}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex.: 200"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Selecione a Atividade:
                </label>
                <select
                  value={atividadeSelecionada.nome}
                  onChange={(e) => {
                    const atividade = atividadesOptions.find(
                      (atv) => atv.nome === e.target.value
                    );
                    if (atividade) setAtividadeSelecionada(atividade);
                  }}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {atividadesOptions.map((atv, index) => (
                    <option key={index} value={atv.nome}>
                      {atv.nome} (Limite:{" "}
                      {atv.limiteTotal === Infinity
                        ? "Sem limite"
                        : atv.tipo === "variavel"
                          ? `${atv.limiteTotal * 100}% do total`
                          : `${atv.limiteTotal} horas`}
                      )
                    </option>
                  ))}
                </select>
              </div>

              {atividadeSelecionada.tipo === "fixo" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Quantidade:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantidadeAtividade}
                    onChange={(e) =>
                      setQuantidadeAtividade(Math.max(1, Number(e.target.value)))
                    }
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex.: 1"
                  />
                </div>
              )}

              {atividadeSelecionada.tipo === "variavel" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Carga Horária do Evento:
                  </label>
                  <input
                    type="number"
                    value={cargaEvento}
                    onChange={(e) => setCargaEvento(Number(e.target.value))}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex.: 5"
                  />
                </div>
              )}

              <button
                onClick={adicionarAtividade}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition transform hover:scale-105 shadow-md"
              >
                Adicionar Atividade
              </button>

              {/* Resumo */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800">Resumo</h2>
                <p className="text-gray-700 mt-2">
                  Carga Horária Cumprida: {cargaCumprida} horas
                </p>
                <p className="text-gray-700">
                  Progresso: {porcentagemCumprida.toFixed(2)}%
                </p>

                <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                      Number(porcentagemCumprida)
                    )}`}
                    style={{ width: `${porcentagemCumprida}%` }}
                  />
                </div>


                {/* Exibição da animação Lottie */}
                <div className="mt-0 flex justify-center items-center">
                  {porcentagemCumprida < 60 ? (
                    <Lottie
                      animationData={animationIncomplete}
                      loop={true}
                      style={{ height: 200, width: 200 }}
                    />
                  ) : porcentagemCumprida > 60 && porcentagemCumprida < 99 ? (
                    <Lottie
                      animationData={morte}
                      loop={true}
                      style={{ height: 200, width: 200 }}
                    />
                  ) :
                    (
                      <Lottie
                        animationData={animationComplete}
                        loop={true}
                        style={{ height: 200, width: 200 }}
                      />
                    )}
                </div>

              </div>
            </div>

            {/* Lista de Atividades */}
            <div className="bg-white p-8 rounded-xl border border-gray-300">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Atividades Adicionadas
              </h2>
              {atividades.length === 0 && (
                <p className="text-gray-500">Nenhuma atividade adicionada.</p>
              )}
              <div className="space-y-4">
                {atividades.map((atv, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-white shadow-sm border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{atv.icone}</span>
                      <p className="text-gray-700">
                        {atv.nome}: <span className="font-bold">{atv.carga}</span> horas
                      </p>
                    </div>
                    <button
                      onClick={() => removerAtividade(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <p>Remover</p>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tooltips para as atividades */}
        <section className="mt-8 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Regras das Atividades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {atividadesOptions.map((atv, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-xs border border-gray-300">
                <div className="flex items-center">
                  <span className="text-xl mr-2">{atv.icone}</span>
                  <h3 className="text-lg font-semibold">{atv.nome}</h3>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{atv.tooltip}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="bg-gray-200 py-4 mt-8">
        <p className="text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} - Sistema de Atividades Complementares
        </p>
      </footer>

      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setIsModalOpen(!isModalOpen)}
          className={`px-4 py-2 rounded-full shadow-lg transition-colors ${isModalOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105'} text-white`}
        >
          {isModalOpen ? "X" : "Me pague um RU"}
        </button>

        {isModalOpen && (
          <div className="absolute bottom-12 right-0 bg-white p-4 rounded-lg shadow-lg border border-gray-300 w-72 text-center">
            <h3 className="font-semibold text-gray-800">Me pague um RU</h3>
            <p className="text-sm text-gray-600 mt-2">
              Eu poderia tá roubando, eu poderia tá resolvendo uma integral tripla para calcular a órbita de um foguete, mas fiz esse site para dar uma facilitadinha da tua vida, então se puder ajudar um pobre e infeliz estudante com um pixzinho...
            </p>
            <div className="flex justify-center items-center mt-2">
              <Lottie animationData={catSad} loop={true} style={{ height: 100, width: 100 }} />
            </div>
            <p>PIX:</p>
            <div className="flex justify-center items-center">
              <Image source={qrCode} style={{ width: 150, height: 150 }} />
            </div>
          </div>
        )}
      </div>

    </div>
  );

}