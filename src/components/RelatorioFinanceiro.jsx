import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button"
import html2canvas from "html2canvas";
import { storage } from "@/lib/storage";
import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    LabelList,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export default function RelatorioFinanceiro() {
    const honorarios = storage.getHonorarios();

    const anos = [
        ...new Set(
            honorarios
                .map((h) => (h.mes_referencia.match(/\d{4}/) ? h.mes_referencia.match(/\d{4}/)[0] : null))
                .filter(Boolean)
        ),
    ];

    const anoAtual = new Date().getFullYear().toString();
    const [anoSelecionado, setAnoSelecionado] = useState(
        anos.includes(anoAtual) ? anoAtual : anos[0] || anoAtual
    );

    const ordemMeses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ];

    const dados = useMemo(() => {
        const mapa = {};

        const obterNomeMes = (mesReferencia) => {
            const ordemMeses = [
                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
            ];

            const mesTexto = ordemMeses.find((m) =>
                mesReferencia.toLowerCase().includes(m.toLowerCase())
            );
            if (mesTexto) return mesTexto;

            const matchAnoMes = mesReferencia.match(/(\d{4})[-\/](\d{1,2})/);
            if (matchAnoMes) {
                const numeroMes = parseInt(matchAnoMes[2], 10);
                return ordemMeses[numeroMes - 1] || "Desconhecido";
            }

            const matchMesAno = mesReferencia.match(/(\d{1,2})[-\/](\d{4})/);
            if (matchMesAno) {
                const numeroMes = parseInt(matchMesAno[1], 10);
                return ordemMeses[numeroMes - 1] || "Desconhecido";
            }

            return "Desconhecido";
        };

        honorarios
            .filter((h) => h.mes_referencia.includes(anoSelecionado))
            .forEach((h) => {
                const mesNome = obterNomeMes(h.mes_referencia);

                if (!mapa[mesNome]) mapa[mesNome] = { mes: mesNome, recebido: 0, pendente: 0, totalPrevisto: 0 };

                mapa[mesNome].totalPrevisto += h.valor_total;
                if (h.status === "pago") mapa[mesNome].recebido += h.valor_total;
                else mapa[mesNome].pendente += h.valor_total;
            });

        return ordemMeses.map((mes) =>
            mapa[mes] || { mes, recebido: 0, pendente: 0, totalPrevisto: 0 }
        );
    }, [honorarios, anoSelecionado]);

    if (!honorarios.length) {
        return (
            <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500">
                Nenhum dado disponível para exibir o gráfico.
            </div>
        );
    }
    const handleExportPDF = async () => {
        const elemento = document.getElementById("relatorio-financeiro");
        if (!elemento) return;

        const canvas = await html2canvas(elemento, {
            scale: 2,
            backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        // 🕒 Cabeçalho formatado
        const dataAtual = new Date();
        const opcoesData = {
            month: "long",
            year: "numeric",
        };
        const mesAno = dataAtual.toLocaleDateString("pt-BR", opcoesData);
        const dataHora = dataAtual.toLocaleString("pt-BR");

        // 🧾 Cabeçalho do relatório
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text("GÊNOVA CONTABILIDADE", 105, 15, { align: "center" });

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.text(`Relatório Financeiro - ${mesAno}`, 105, 22, { align: "center" });
        pdf.text(`Gerado em: ${dataHora}`, 105, 28, { align: "center" });

        // 🖼️ Imagem do relatório
        const imgWidth = 190;
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const position = 35;

        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);

        // 💾 Salva com nome automático
        pdf.save(`relatorio-financeiro-${anoSelecionado}.pdf`);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    Evolução Financeira ({anoSelecionado})
                </h2>

                <select
                    value={anoSelecionado}
                    onChange={(e) => setAnoSelecionado(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                >
                    {anos.map((ano) => (
                        <option key={ano} value={ano}>
                            {ano}
                        </option>
                    ))}
                </select>
            </div>

            {/* 🧾 Aqui envolvemos tudo com o id */}
            <div id="relatorio-financeiro">
                <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart
                        data={dados}
                        margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="mes" />
                        <YAxis
                            tickFormatter={(value) => formatCurrency(value)}
                            width={80}
                        />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />

                        <Bar dataKey="pendente" fill="#3b82f6" name="Pendente">
                            <LabelList
                                dataKey="pendente"
                                position="top"
                                formatter={(v) =>
                                    v > 0 ? `R$ ${v.toFixed(2).replace(".", ",")}` : ""
                                }
                                style={{
                                    fontSize: 12,
                                    fill: "#3b82f6",
                                    fontWeight: 600,
                                }}
                            />
                        </Bar>

                        <Bar dataKey="recebido" fill="#10b981" name="Recebido">
                            <LabelList
                                dataKey="recebido"
                                position="top"
                                formatter={(v) =>
                                    v > 0 ? `R$ ${v.toFixed(2).replace(".", ",")}` : ""
                                }
                                style={{
                                    fontSize: 12,
                                    fill: "#10b981",
                                    fontWeight: 600,
                                }}
                            />
                        </Bar>

                        <Line
                            type="monotone"
                            dataKey="totalPrevisto"
                            stroke="#d4af37"
                            strokeWidth={3}
                            name="Total Previsto"
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        >
                            <LabelList
                                dataKey="totalPrevisto"
                                position="top"
                                formatter={(v) =>
                                    v > 0 ? `R$ ${v.toFixed(2).replace(".", ",")}` : ""
                                }
                                style={{
                                    fontSize: 12,
                                    fill: "#b88e1c",
                                    fontWeight: 600,
                                }}
                            />
                        </Line>
                    </ComposedChart>
                </ResponsiveContainer>

                {/* 🧾 Tabela detalhada mensal */}
                <div className="mt-8 overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-sm">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">Mês</th>
                                <th className="px-4 py-3 text-right">Total Previsto</th>
                                <th className="px-4 py-3 text-right">Recebido</th>
                                <th className="px-4 py-3 text-right">Pendente</th>
                                <th className="px-4 py-3 text-right">% Pago</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dados.map((item) => {
                                const porcentagem =
                                    item.totalPrevisto > 0
                                        ? ((item.recebido / item.totalPrevisto) * 100).toFixed(1)
                                        : 0;

                                return (
                                    <tr key={item.mes} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium text-gray-800">
                                            {item.mes}
                                        </td>
                                        <td className="px-4 py-2 text-right text-[#b88e1c] font-semibold">
                                            {formatCurrency(item.totalPrevisto)}
                                        </td>
                                        <td className="px-4 py-2 text-right text-green-600 font-semibold">
                                            {formatCurrency(item.recebido)}
                                        </td>
                                        <td className="px-4 py-2 text-right text-blue-600 font-semibold">
                                            {formatCurrency(item.pendente)}
                                        </td>
                                        <td className="px-4 py-2 text-right text-gray-800 font-semibold">
                                            {porcentagem}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 📤 Botão fora do container para não sair no PDF */}
            <div className="mt-6 flex justify-end">
                <Button
                    onClick={handleExportPDF}
                    className="bg-[#d4af37] hover:bg-[#c49d2f] text-white font-medium px-4 py-2 rounded-lg"
                >
                    Exportar Relatório em PDF
                </Button>
            </div>
        </div>
    );

}
