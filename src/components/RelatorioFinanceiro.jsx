import React, { useMemo, useState } from "react";
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
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export default function RelatorioFinanceiro() {
    const honorarios = storage.getHonorarios();

    // 🔍 Normaliza a leitura de ano — pega os 4 últimos dígitos do campo mes_referencia
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

    // 🔢 Mapeamento de meses (para ordenação)
    const ordemMeses = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
    ];

    const dados = useMemo(() => {
        const mapa = {};

        const obterNomeMes = (mesReferencia) => {
            const ordemMeses = [
                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
            ];

            // 1️⃣ Se for formato "Outubro/2025"
            const mesTexto = ordemMeses.find((m) =>
                mesReferencia.toLowerCase().includes(m.toLowerCase())
            );
            if (mesTexto) return mesTexto;

            // 2️⃣ Se for formato numérico "10/2025" ou "2025-10"
            const matchAnoMes = mesReferencia.match(/(\d{4})[-\/](\d{1,2})/);
            if (matchAnoMes) {
                const numeroMes = parseInt(matchAnoMes[2], 10);
                return ordemMeses[numeroMes - 1] || "Desconhecido";
            }

            // 3️⃣ Se for formato "10/2025" (invertido)
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

                if (!mapa[mesNome]) mapa[mesNome] = { mes: mesNome, recebido: 0, pendente: 0, total: 0 };

                mapa[mesNome].total += h.valor_total;
                if (h.status === "pago") mapa[mesNome].recebido += h.valor_total;
                else mapa[mesNome].pendente += h.valor_total;
            });

        const ordemMeses = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
        ];

        return ordemMeses.map((mes) => mapa[mes] || { mes, recebido: 0, pendente: 0, total: 0 });
    }, [honorarios, anoSelecionado]);

    if (!honorarios.length) {
        return (
            <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500">
                Nenhum dado disponível para exibir o gráfico.
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    Evolução Financeira ({anoSelecionado})
                </h2>

                {/* 🔽 Filtro de Ano */}
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

            <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={dados}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />

                    <Bar dataKey="recebido" fill="#10b981" name="Recebido" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pendente" fill="#3b82f6" name="Pendente" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="total" stroke="#d4af37" strokeWidth={3} name="Total Previsto" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}