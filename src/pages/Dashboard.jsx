import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { TrendingUp, DollarSign, Clock, AlertCircle } from 'lucide-react';
import CardResumo from '@/components/CardResumo';
import { storage } from '@/lib/storage';
import { getCurrentMonthYear } from '@/lib/utils';
import RelatorioFinanceiro from "@/components/RelatorioFinanceiro";

const Dashboard = () => {
    const [stats, setStats] = useState({
        previsto: 0,
        recebido: 0,
        pendente: 0,
        atrasado: 0
    });
    const location = useLocation();

    const calculateStats = useCallback(() => {
        const honorarios = storage.getHonorarios();
        const currentMonth = getCurrentMonthYear();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentMonthHonorarios = honorarios.filter(h => h.mes_referencia === currentMonth);

        const previsto = currentMonthHonorarios.reduce((sum, h) => sum + h.valor_total, 0);
        const recebido = currentMonthHonorarios
            .filter(h => h.status === 'pago')
            .reduce((sum, h) => sum + h.valor_total, 0);

        const pendenteTotal = currentMonthHonorarios
            .filter(h => h.status === 'pendente')
            .reduce((sum, h) => sum + h.valor_total, 0);

        const atrasado = currentMonthHonorarios
            .filter(h => {
                const vencimento = new Date(h.data_vencimento + 'T00:00:00-03:00'); // Consider local timezone
                return h.status === 'pendente' && vencimento < today;
            })
            .reduce((sum, h) => sum + h.valor_total, 0);

        const pendente = pendenteTotal - atrasado;

        setStats({ previsto, recebido, pendente, atrasado });
    }, []);

    useEffect(() => {
        calculateStats();
        // Recalculate stats every time we navigate back to the dashboard
        // to ensure data is fresh after changes on other pages.
    }, [location.pathname, calculateStats]);

    return (
        <>
            <Helmet>
                <title>Dashboard - Gênova Contabilidade</title>
                <meta name="description" content="Visão geral financeira do escritório de contabilidade" />
            </Helmet>

            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Financeiro</h1>
                    <p className="text-gray-600">Visão geral dos honorários do mês atual</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <CardResumo
                        title="Previsto"
                        value={stats.previsto}
                        icon={TrendingUp}
                        color="#d4af37"
                        delay={0}
                    />
                    <CardResumo
                        title="Recebido"
                        value={stats.recebido}
                        icon={DollarSign}
                        color="#10b981"
                        delay={0.1}
                    />
                    <CardResumo
                        title="Pendente"
                        value={stats.pendente}
                        icon={Clock}
                        color="#3b82f6"
                        delay={0.2}
                    />
                    <CardResumo
                        title="Atrasado"
                        value={stats.atrasado}
                        icon={AlertCircle}
                        color="#ef4444"
                        delay={0.3}
                    />
                </div>
                <RelatorioFinanceiro />
            </div>
        </>
    );
};

export default Dashboard;