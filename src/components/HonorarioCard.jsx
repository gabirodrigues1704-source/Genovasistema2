import React, { useState } from 'react';
import { Download, Trash2, Plus, CheckCircle, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Modal from '@/components/Modal';
import ExtraServiceForm from '@/components/ExtraServiceForm';
import { formatCurrency, formatDate, formatMonthYear } from '@/lib/utils';
import { generateHonorarioPDF } from '@/lib/pdfGenerator';
import { useToast } from '@/components/ui/use-toast';
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

const HonorarioCard = ({ honorario, cliente, onUpdate, onDelete }) => {
    const [isExtraServiceModalOpen, setIsExtraServiceModalOpen] = useState(false);
    const { toast } = useToast();

    if (!cliente) return null;

    const isOverdue = honorario.status === 'pendente' && new Date(honorario.data_vencimento) < new Date() && !honorario.data_pagamento;

    const handleToggleStatus = () => {
        const isNowPaid = honorario.status === 'pendente';
        const updatedHonorario = {
            ...honorario,
            status: isNowPaid ? 'pago' : 'pendente',
            data_pagamento: isNowPaid ? new Date().toISOString().split('T')[0] : null
        };
        onUpdate(updatedHonorario);

        toast({
            title: isNowPaid ? "Marcado como pago!" : "Marcado como pendente!",
            description: `Status do honorário atualizado.`
        });
    };
    const [editingService, setEditingService] = useState(null);
    const handleEditExtraService = (index, servico) => {
        setIsExtraServiceModalOpen(true);
        setEditingService({ index, servico });
    };

    const handleDeleteExtraService = (index) => {
        const updatedServicos = honorario.servicos_extras.filter((_, i) => i !== index);
        const novoTotal = honorario.valor_base + updatedServicos.reduce((sum, s) => sum + s.valor, 0);

        const updatedHonorario = {
            ...honorario,
            servicos_extras: updatedServicos,
            valor_total: novoTotal
        };

        onUpdate(updatedHonorario);
        toast({
            title: "Serviço extra removido!",
            description: "O serviço foi excluído com sucesso."
        });
    };

    const handleAddExtraService = (service) => {
        const updatedServicos = [...(honorario.servicos_extras || []), service];
        const novoTotal = honorario.valor_base + updatedServicos.reduce((sum, s) => sum + s.valor, 0);

        const updatedHonorario = {
            ...honorario,
            servicos_extras: updatedServicos,
            valor_total: novoTotal
        };

        onUpdate(updatedHonorario);
        setIsExtraServiceModalOpen(false);

        toast({
            title: "Serviço extra adicionado!",
            description: `${service.descricao} foi adicionado ao honorário.`
        });
    };

    const handleDownloadPDF = async () => {
        try {
            await generateHonorarioPDF(honorario, cliente);
            toast({
                title: "PDF gerado!",
                description: "O recibo foi baixado com sucesso.",
            });
        } catch (error) {
            console.error("PDF generation error:", error);
            toast({
                title: "Erro ao gerar PDF",
                description: `Ocorreu um erro ao gerar o PDF: ${error.message}`,
                variant: "destructive",
            });
        }
    };
    const handleSendWhatsApp = () => {
        if (!cliente.telefone) {
            toast({
                title: "Telefone não encontrado",
                description: "Este cliente não possui número de WhatsApp cadastrado.",
                variant: "destructive",
            });
            return;
        }

        // Remove caracteres não numéricos (somente números)
        const phone = cliente.telefone.replace(/\D/g, '');

        // Cria a mensagem padrão
        const message = `Olá ${cliente.nome}, segue o recibo do seu honorário referente a ${formatMonthYear(honorario.mes_referencia)}.
Valor total: ${formatCurrency(honorario.valor_total)} 💼📄
Obrigado pela parceria!`;

        // Cria o link do WhatsApp
        const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;

        // Abre o WhatsApp em nova aba
        window.open(whatsappUrl, '_blank');
        const updatedHonorario = { ...honorario, enviado_whatsapp: true };
        onUpdate(updatedHonorario);

        toast({
            title: "Mensagem aberta no WhatsApp!",
            description: `Enviando honorário para ${cliente.nome}.`,
        });
    };
    const handleMarkAsSent = () => {
        const updatedHonorario = { ...honorario, enviado_whatsapp: !honorario.enviado_whatsapp };

        onUpdate(updatedHonorario);

        toast({
            title: updatedHonorario.enviado_whatsapp
                ? "Honorário marcado como enviado ✅"
                : "Envio desmarcado",
            description: `Status atualizado para ${cliente.nome}.`,
        });
    };

    return (
        <>
            <div className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 ${honorario.status === 'pago' ? 'border-green-500' : isOverdue ? 'border-red-500' : 'border-[#d4af37]'
                }`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{cliente.nome}</h3>
                            {honorario.status === 'pago' ? (
                                <span className="flex items-center text-green-600 text-sm font-medium">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Pago em {formatDate(honorario.data_pagamento)}
                                </span>
                            ) : isOverdue ? (
                                <span className="flex items-center text-red-600 text-sm font-medium">
                                    <Clock className="w-4 h-4 mr-1" />
                                    Atrasado
                                </span>
                            ) : (
                                <span className="flex items-center text-blue-600 text-sm font-medium">
                                    <Clock className="w-4 h-4 mr-1" />
                                    Pendente
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600 text-sm">Referência: {formatMonthYear(honorario.mes_referencia)}</p>
                    </div>

                    <div className="flex space-x-2">
                        <Button
                            onClick={() => handleMarkAsSent()}
                            variant="outline"
                            size="sm"
                            className={honorario.enviado_whatsapp
                                ? "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                                : "border-gray-400 text-gray-500 hover:bg-gray-100"
                            }
                        >
                            {honorario.enviado_whatsapp ? "Enviado ✅" : "Marcar como Enviado"}
                        </Button>
                        <Button
                            onClick={() => handleSendWhatsApp()}
                            variant="outline"
                            size="sm"
                            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                        >
                            <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={handleToggleStatus}
                            variant="outline"
                            size="sm"
                            className={honorario.status === 'pago'
                                ? "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                                : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                            }
                        >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {honorario.status === 'pago' ? 'Reabrir' : 'Pagar'}
                        </Button>
                        <Button
                            onClick={handleDownloadPDF}
                            variant="outline"
                            size="sm"
                            className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-white"
                        >
                            <Download className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita e irá excluir permanentemente este honorário.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete(honorario.id)}>Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                        <p className="text-sm text-gray-600">Valor Base</p>
                        <p className="text-lg font-semibold text-gray-900">{formatCurrency(honorario.valor_base)}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600">Serviços Extras</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(honorario.servicos_extras?.reduce((sum, s) => sum + s.valor, 0) || 0)}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600">Valor Total</p>
                        <p className="text-lg font-semibold text-[#d4af37]">{formatCurrency(honorario.valor_total)}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600">Vencimento</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(honorario.data_vencimento)}</p>
                    </div>
                </div>

                {honorario.servicos_extras && honorario.servicos_extras.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Serviços Extras:</p>
                        <div className="space-y-2">
                            {honorario.servicos_extras.map((servico, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{servico.descricao}</p>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(servico.data)} — {formatCurrency(servico.valor)}
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {/* Botão editar */}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                                            onClick={() => handleEditExtraService(index, servico)}
                                        >
                                            Editar
                                        </Button>

                                        {/* Botão excluir */}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                            onClick={() => handleDeleteExtraService(index)}
                                        >
                                            Excluir
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Button
                    onClick={() => setIsExtraServiceModalOpen(true)}
                    variant="outline"
                    size="sm"
                    className="w-full border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Serviço Extra
                </Button>
            </div>

            <Modal
                isOpen={isExtraServiceModalOpen}
                onClose={() => {
                    setIsExtraServiceModalOpen(false);
                    setEditingService(null);
                }}
                title={editingService ? "Editar Serviço Extra" : "Adicionar Serviço Extra"}
                size="md"
            >
                <ExtraServiceForm
                    existingService={editingService?.servico}
                    onSave={(service) => {
                        if (editingService) {
                            // Editando serviço existente
                            const updatedServicos = [...honorario.servicos_extras];
                            updatedServicos[editingService.index] = service;
                            const novoTotal = honorario.valor_base + updatedServicos.reduce((sum, s) => sum + s.valor, 0);
                            onUpdate({
                                ...honorario,
                                servicos_extras: updatedServicos,
                                valor_total: novoTotal
                            });
                            toast({
                                title: "Serviço extra atualizado!",
                                description: `${service.descricao} foi atualizado com sucesso.`
                            });
                        } else {
                            // Adicionando novo serviço
                            handleAddExtraService(service);
                        }
                        setIsExtraServiceModalOpen(false);
                        setEditingService(null);
                    }}
                    onCancel={() => {
                        setIsExtraServiceModalOpen(false);
                        setEditingService(null);
                    }}
                />
            </Modal>
        </>
    );
};

export default HonorarioCard;