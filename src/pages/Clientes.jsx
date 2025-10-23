import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, FileWarning, FileCheck2, FileClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Modal from '@/components/Modal';
import ClienteForm from '@/components/ClienteForm';
import { storage } from '@/lib/storage';
import { formatCNPJ, formatPhone, formatCEP, formatCurrency } from '@/lib/utils';
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

const getDocumentationStatus = (documentacao) => {
    if (!documentacao) {
        return { status: 'Pendente', icon: FileWarning, color: 'text-red-500' };
    }
    const docs = Object.values(documentacao);
    const totalDocs = docs.length;
    const entreguesCount = docs.filter(d => d.entregue).length;

    if (entreguesCount === 0) {
        return { status: 'Pendente', icon: FileWarning, color: 'text-red-500' };
    }
    if (entreguesCount === totalDocs) {
        return { status: 'OK', icon: FileCheck2, color: 'text-green-500' };
    }
    return { status: 'Parcial', icon: FileClock, color: 'text-yellow-500' };
};

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCliente, setEditingCliente] = useState(null);
    const [clienteToDeleteId, setClienteToDeleteId] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        loadClientes();
    }, []);

    useEffect(() => {
        filterClientes();
    }, [searchTerm, clientes]);

    const loadClientes = () => {
        const data = storage.getClients();
        setClientes(data);
    };

    const filterClientes = () => {
        if (!searchTerm) {
            setFilteredClientes(clientes);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = clientes.filter(c =>
            c.nome.toLowerCase().includes(term) ||
            c.cnpj.includes(term) ||
            c.cidade.toLowerCase().includes(term)
        );
        setFilteredClientes(filtered);
    };

    const handleSave = (clienteData) => {
        const updatedClientes = editingCliente
            ? clientes.map(c => c.id === editingCliente.id ? clienteData : c)
            : [...clientes, clienteData];

        storage.saveClients(updatedClientes);
        setClientes(updatedClientes);
        setIsModalOpen(false);
        setEditingCliente(null);

        toast({
            title: editingCliente ? "Cliente atualizado!" : "Cliente cadastrado!",
            description: `${clienteData.nome} foi ${editingCliente ? 'atualizado' : 'cadastrado'} com sucesso.`
        });
    };

    const handleEdit = (cliente) => {
        setEditingCliente(cliente);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!clienteToDeleteId) return;

        const updatedClientes = clientes.filter(c => c.id !== clienteToDeleteId);
        storage.saveClients(updatedClientes);
        setClientes(updatedClientes);

        toast({
            title: "Cliente excluído!",
            description: "O cliente foi removido com sucesso."
        });
        setClienteToDeleteId(null);
    };

    const handleNewCliente = () => {
        setEditingCliente(null);
        setIsModalOpen(true);
    };

    return (
        <>
            <Helmet>
                <title>Clientes - Gênova Contabilidade</title>
                <meta name="description" content="Gestão de clientes do escritório de contabilidade" />
            </Helmet>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Clientes</h1>
                        <p className="text-gray-600">Gerencie seus clientes cadastrados</p>
                    </div>
                    <Button
                        onClick={handleNewCliente}
                        className="bg-[#d4af37] hover:bg-[#c49d2f] text-white"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Novo Cliente
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, CNPJ ou cidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredClientes.map(cliente => {
                        const docStatus = getDocumentationStatus(cliente.documentacao);
                        const StatusIcon = docStatus.icon;

                        return (
                            <div
                                key={cliente.id}
                                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <h3 className="text-xl font-bold text-gray-900">{cliente.nome}</h3>
                                            {cliente.ativo ? (
                                                <span className="flex items-center text-green-600 text-sm bg-green-100 px-2 py-1 rounded-full">
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-red-600 text-sm bg-red-100 px-2 py-1 rounded-full">
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Inativo
                                                </span>
                                            )}
                                            <span className={`flex items-center text-sm ${docStatus.color} bg-gray-100 px-2 py-1 rounded-full`}>
                                                <StatusIcon className="w-4 h-4 mr-1" />
                                                Docs: {docStatus.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">CNPJ:</span> {formatCNPJ(cliente.cnpj)}
                                            </div>
                                            <div>
                                                <span className="font-medium">Telefone:</span> {formatPhone(cliente.telefone)}
                                            </div>
                                            <div>
                                                <span className="font-medium">Email:</span> {cliente.email}
                                            </div>
                                            <div>
                                                <span className="font-medium">Cidade:</span> {cliente.cidade}
                                            </div>
                                            <div>
                                                <span className="font-medium">CEP:</span> {formatCEP(cliente.cep)}
                                            </div>
                                            <div>
                                                <span className="font-medium">Honorário:</span> {formatCurrency(cliente.valor_honorario)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2 ml-4">
                                        <Button
                                            onClick={() => handleEdit(cliente)}
                                            variant="outline"
                                            size="sm"
                                            className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-white"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <AlertDialog onOpenChange={(open) => !open && setClienteToDeleteId(null)}>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    onClick={() => setClienteToDeleteId(cliente.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            {clienteToDeleteId === cliente.id && (
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta ação não pode ser desfeita. Isso excluirá permanentemente
                                                            este cliente e removerá seus dados de nossos servidores.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={handleConfirmDelete}>Continuar</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            )}
                                        </AlertDialog>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredClientes.length === 0 && (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center">
                            <p className="text-gray-500 text-lg">Nenhum cliente encontrado</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCliente(null);
                }}
                title={editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
                size="xl"
            >
                <ClienteForm
                    cliente={editingCliente}
                    onSave={handleSave}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditingCliente(null);
                    }}
                />
            </Modal>
        </>
    );
};

export default Clientes;