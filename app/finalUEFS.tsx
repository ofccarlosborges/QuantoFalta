import { Image, Text } from 'react-native';
import React, { useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import Lottie from "lottie-react";
import animationIncomplete from "./src/animationIncomplete.json";
import animationComplete from "./src/animationComplete.json";
import catSad from "./src/catSad.json";
import morte from "./src/morte.json";
import morty from "./src/morty.json";
import caixaDanca from "./src/caixaDanca.json";
import { Link } from "expo-router";
import qrCode from "./src/qrCode.jpg";

interface nota {
  nota: string;
  peso: string;
}

interface StatusMessage {
  text: string;
  color: string;
  animation: any;
}

export default function finalUEFS() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [notas, setnotas] = useState<nota[]>([
    { nota: '', peso: '' },
    { nota: '', peso: '' }
  ]);
  const [media, setmedia] = useState<number | null>(null);
  const [finalNota, setFinalnota] = useState<number | null>(null);
  const [isReprovado, setIsReprovado] = useState<boolean>(false);
  const [isAprovado, setAprovado] = useState<boolean>(false);

  const addnota = (): void => {
    setnotas([...notas, { nota: '', peso: '' }]);
  };

  const removenota = (index: number): void => {
    const newnotas = notas.filter((_, i) => i !== index);
    setnotas(newnotas);
  };

  const handleChange = (index: number, field: keyof nota, value: string): void => {
    const newnotas = [...notas];
    newnotas[index][field] = value;
    setnotas(newnotas);
  };

  const calculatemedia = (): number | null => {
    let totalPeso = 0;
    let somaPonderada = 0;

    for (const nota of notas) {
      const notaValue = parseFloat(nota.nota);
      const pesoValue = parseFloat(nota.peso);

      if (!isNaN(notaValue) && !isNaN(pesoValue)) {
        somaPonderada += notaValue * pesoValue;
        totalPeso += pesoValue;
      }
    }

    if (totalPeso === 0) return null;
    return somaPonderada / totalPeso;
  };

  const calculateFinalnota = (md: number): number | null => {
    if (md < 3.0) {
      return null; // Reprovado direto
    }
    // NFm = 12.5 - (1.5 * MD)
    let nfm = 12.5 - (1.5 * md);

    // Nota minima necessaria 3.0
    if (nfm < 3.0) nfm = 3.0;

    return nfm;
  };

  const handleCalculate = (): void => {
    const md = calculatemedia();
    if (md === null) return;

    setmedia(md);
    setIsReprovado(md < 3.0);
    setAprovado(md >= 7.0);
    setFinalnota(calculateFinalnota(md));
  };

  const getStatusMessage = (finalNota: number): StatusMessage => {
    if (finalNota >= 3.0 && finalNota <= 5.3) {
      return {
        text: "Você consegue!",
        color: "text-green-600",
        animation: animationComplete as any
      };
    } else if (finalNota > 5.3 && finalNota <= 7.7) {
      return {
        text: "Situação muito difícil",
        color: "text-yellow-600",
        animation: animationIncomplete as any
      };
    } else if (finalNota > 7.7 && finalNota <= 10) {
      return {
        text: "Estado de risco",
        color: "text-orange-600",
        animation: morte as any
      };
    }
    return {
      text: "",
      color: "",
      animation: catSad as any // fallback animation
    };
  };
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

      <main className="flex-1 container mx-auto p-8 mt-7 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex-col mb-8">
            <h1 className="text-4xl font-extrabold text-center text-gray-500">
              Cálculo de
            </h1>
            <h1 className="text-4xl text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-600 mb-5">
              Nota da Final
            </h1>
            <p className="text-center text-gray-700 mt-2 font-bold">
              Descubra a nota mínima necessária para passar direto!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Calculadora*/}
            <div className="bg-white p-8 rounded-xl border border-gray-300">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Insira suas notas e pesos:
              </h2>

              {notas.map((nota, index) => (
                <div key={index} className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      className="border border-gray-400 rounded-lg p-3 text-lg w-full"
                      placeholder="Nota"
                      value={nota.nota}
                      onChange={(e) => handleChange(index, 'nota', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      className="border border-gray-400 rounded-lg p-3 text-lg w-full"
                      placeholder="Peso"
                      value={nota.peso}
                      onChange={(e) => handleChange(index, 'peso', e.target.value)}
                    />
                  </div>
                  {notas.length > 2 && (
                    <button
                      onClick={() => removenota(index)}
                      className="px-4 py-2 text-red-600 hover:text-red-800"
                      type="button"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addnota}
                className="text-purple-600 hover:text-purple-800 font-semibold mb-4"
                type="button"
              >
                + Adicionar nota
              </button>

              <button
                onClick={handleCalculate}
                className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
                type="button"
              >
                Calcular Nota Final
              </button>
            </div>

            {/* Resultado */}
            <div className="flex items-center justify-center text-center">
              {media !== null ? (
                <div className="bg-gray-100 p-8 rounded-lg w-full h-fit ">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Sua média é:</h2>
                    <p className="text-3xl font-extrabold text-purple-600 mt-2">
                      {media.toFixed(2)}
                    </p>
                  </div>
                  {isReprovado ? (
                    <div className="mt-4">
                      <h2 className="text-2xl font-bold text-red-600">Reprovado</h2>
                      <p className="text-gray-700 mt-2 font-bold">
                        Sua média está abaixo de 3.0, não é possível fazer a prova final.
                      </p>
                      <div className="flex justify-center items-center mt-2">
                        <Lottie animationData={morty} loop={true} style={{ height: 100, width: 100 }} />
                      </div>
                    </div>
                  ) : isAprovado ? (
                    <div className="mt-0">
                      <h2 className="text-2xl font-bold text-green-600">Aprovado</h2>
                      <p className="text-gray-700 mt-2 font-bold">
                        Você não tá na final.
                      </p>
                      <div className="flex justify-center items-center">
                        <Lottie animationData={caixaDanca} loop={true} style={{ height: 200, width: 200 }} />
                      </div>
                    </div>
                  ) : finalNota !== null && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Você precisa tirar:</h2>
                      <p className="text-3xl font-extrabold text-purple-600 mt-2">
                        {finalNota.toFixed(2)}
                      </p>
                      {finalNota >= 3.0 && finalNota <= 10 && (
                        <div className="mt-2 flex flex-col items-center">
                          <p className={`${getStatusMessage(finalNota).color} font-semibold text-lg text-center`}>
                            {getStatusMessage(finalNota).text}
                          </p>
                          <Lottie
                            animationData={getStatusMessage(finalNota).animation}
                            loop
                            style={{ height: 200, width: 200 }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-center">
                  Insira suas notas e clique em calcular para ver o resultado
                </div>
              )}
            </div>
          </div>
        </div>
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