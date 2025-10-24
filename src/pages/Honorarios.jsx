import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, FileText, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Modal from '@/components/Modal';
import HonorarioCard from '@/components/HonorarioCard';
import { storage } from '@/lib/storage';
import { getCurrentMonthYear } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { generateBatchPDFs } from '@/lib/pdfGenerator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


const Honorarios = () => {
    const [honorarios, setHonorarios] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [filteredHonorarios, setFilteredHonorarios] = useState([]);
    const [honorarioToDeleteId, setHonorarioToDeleteId] = useState(null);
    const [filters, setFilters] = useState({
        mes: getCurrentMonthYear(),
        cliente: '',
        status: ''
    });
    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, honorarios]);

    const loadData = () => {
        const hon = storage.getHonorarios();
        const cli = storage.getClients();
        setHonorarios(hon);
        setClientes(cli);
    };

    const applyFilters = () => {
        let filtered = [...honorarios];

        if (filters.mes) {
            filtered = filtered.filter(h => h.mes_referencia === filters.mes);
        }

        if (filters.cliente) {
            filtered = filtered.filter(h => h.cliente_id === filters.cliente);
        }

        if (filters.status) {
            filtered = filtered.filter(h => h.status === filters.status);
        }

        setFilteredHonorarios(filtered);
    };

    const handleGenerateMonth = () => {
        const activeClients = clientes.filter(c => c.ativo);

        if (activeClients.length === 0) {
            toast({
                title: "Nenhum cliente ativo",
                description: "Cadastre clientes ativos antes de gerar honorários.",
                variant: "destructive"
            });
            return;
        }

        const currentMonth = getCurrentMonthYear();
        const existingHonorarios = honorarios.filter(h => h.mes_referencia === currentMonth);
        const existingClientIds = existingHonorarios.map(h => h.cliente_id);

        const newHonorarios = activeClients
            .filter(c => !existingClientIds.includes(c.id))
            .map(cliente => {
                const [year, month] = currentMonth.split('-');
                const dueDate = new Date(parseInt(year), parseInt(month) - 1, cliente.dia_vencimento_honorario);

                return {
                    id: `hon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    cliente_id: cliente.id,
                    mes_referencia: currentMonth,
                    valor_base: cliente.valor_honorario,
                    servicos_extras: [],
                    valor_total: cliente.valor_honorario,
                    data_vencimento: dueDate.toISOString().split('T')[0],
                    status: 'pendente',
                    forma_pagamento: null,
                    data_pagamento: null,
                    observacoes: '',
                    enviado_whatsapp: false, // 👈 novo campo
                    created_at: new Date().toISOString()
                };
            });

        if (newHonorarios.length === 0) {
            toast({
                title: "Honorários já gerados",
                description: "Todos os clientes ativos já possuem honorários para este mês.",
            });
            return;
        }

        const updatedHonorarios = [...honorarios, ...newHonorarios];
        storage.saveHonorarios(updatedHonorarios);
        setHonorarios(updatedHonorarios);

        toast({
            title: "Honorários gerados!",
            description: `${newHonorarios.length} honorário(s) criado(s) com sucesso.`
        });
    };

    const handleUpdate = (updatedHonorario) => {
        const updatedHonorarios = honorarios.map(h =>
            h.id === updatedHonorario.id ? updatedHonorario : h
        );
        storage.saveHonorarios(updatedHonorarios);
        setHonorarios(updatedHonorarios);
    };

    const handleConfirmDelete = () => {
        if (!honorarioToDeleteId) return;

        const updatedHonorarios = honorarios.filter(h => h.id !== honorarioToDeleteId);
        storage.saveHonorarios(updatedHonorarios);
        setHonorarios(updatedHonorarios);

        toast({
            title: "Honorário excluído!",
            description: "O honorário foi removido com sucesso."
        });
        setHonorarioToDeleteId(null);
    };

    const handleBatchDownload = async () => {
        if (filteredHonorarios.length === 0) {
            toast({
                title: "Nenhum honorário",
                description: "Não há honorários para gerar PDFs.",
                variant: "destructive"
            });
            return;
        }

        toast({
            title: "Gerando PDFs...",
            description: "Aguarde enquanto os PDFs são gerados."
        });

        try {
            await generateBatchPDFs(filteredHonorarios, clientes);
            toast({
                title: "PDFs gerados!",
                description: "O arquivo ZIP foi baixado com sucesso."
            });
        } catch (error) {
            toast({
                title: "Erro ao gerar PDFs",
                description: "Ocorreu um erro ao gerar os PDFs.",
                variant: "destructive"
            });
        }
    };

    return (
        <>
            <Helmet>
                <title>Honorários - Gênova Contabilidade</title>
                <meta name="description" content="Gestão de honorários mensais" />
            </Helmet>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Honorários</h1>
                        <p className="text-gray-600">Gerencie os honorários mensais dos clientes</p>
                    </div>
                    <div className="flex space-x-3">
                        <Button
                            onClick={handleBatchDownload}
                            variant="outline"
                            className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-white"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            Baixar PDFs
                        </Button>
                        <Button
                            onClick={handleGenerateMonth}
                            className="bg-[#d4af37] hover:bg-[#c49d2f] text-white"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Gerar Mês
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mês/Ano
                            </label>
                            <input
                                type="month"
                                value={filters.mes}
                                onChange={(e) => setFilters(prev => ({ ...prev, mes: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cliente
                            </label>
                            <select
                                value={filters.cliente}
                                onChange={(e) => setFilters(prev => ({ ...prev, cliente: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                            >
                                <option value="">Todos</option>
                                {clientes.map(c => (
                                    <option key={c.id} value={c.id}>{c.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                            >
                                <option value="">Todos</option>
                                <option value="pendente">Pendente</option>
                                <option value="pago">Pago</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredHonorarios.map(honorario => {
                        const cliente = clientes.find(c => c.id === honorario.cliente_id);
                        return (
                            <HonorarioCard
                                key={honorario.id}
                                honorario={honorario}
                                cliente={cliente}
                                onUpdate={handleUpdate}
                                onDelete={() => setHonorarioToDeleteId(honorario.id)}
                            />
                        );
                    })}

                    {filteredHonorarios.length === 0 && (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Nenhum honorário encontrado</p>
                            <p className="text-gray-400 text-sm mt-2">
                                Clique em "Gerar Mês" para criar honorários para os clientes ativos
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <AlertDialog open={!!honorarioToDeleteId} onOpenChange={(open) => !open && setHonorarioToDeleteId(null)}>
                {honorarioToDeleteId && (
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente
                                este honorário.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmDelete}>Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                )}
            </AlertDialog>
        </>
    );
};

export default Honorarios;