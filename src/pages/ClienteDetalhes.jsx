import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, CheckCircle, XCircle } from "lucide-react";
import { storage } from "@/lib/storage";
import { formatCNPJ, formatPhone, formatCEP, formatCurrency } from "@/lib/utils";

export default function ClienteDetalhes() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cliente, setCliente] = useState(null);

    useEffect(() => {
        const clientes = storage.getClients();
        const encontrado = clientes.find((c) => c.id === id);
        setCliente(encontrado || null);
    }, [id]);

    if (!cliente) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-600">
                <FileText className="w-12 h-12 mb-3 text-gray-400" />
                <p className="text-lg">Cliente não encontrado</p>
                <Button
                    onClick={() => navigate("/clientes")}
                    className="mt-4 bg-[#d4af37] hover:bg-[#c49d2f] text-white"
                >
                    Voltar
                </Button>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{cliente.nome} - Detalhes do Cliente</title>
            </Helmet>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {cliente.nome}
                        </h1>
                        <p className="text-gray-600">Detalhes completos do cliente</p>
                    </div>

                    <Button
                        onClick={() => navigate("/clientes")}
                        variant="outline"
                        className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 space-y-6 border border-gray-100">
                    {/* Dados gerais */}
                    <section>
                        <h2 className="text-xl font-semibold text-[#d4af37] mb-3 border-b pb-2">
                            Dados Gerais
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
                            <p><span className="font-medium">CNPJ:</span> {formatCNPJ(cliente.cnpj)}</p>
                            <p><span className="font-medium">Telefone:</span> {formatPhone(cliente.telefone)}</p>
                            <p><span className="font-medium">Email:</span> {cliente.email}</p>
                            <p><span className="font-medium">Endereço:</span> {cliente.endereco}</p>
                            <p><span className="font-medium">Cidade:</span> {cliente.cidade}</p>
                            <p><span className="font-medium">CEP:</span> {formatCEP(cliente.cep)}</p>
                            <p><span className="font-medium">Valor Honorário:</span> {formatCurrency(cliente.valor_honorario)}</p>
                            <p><span className="font-medium">Dia Vencimento:</span> {cliente.dia_vencimento_honorario}</p>
                            <p>
                                <span className="font-medium">Status:</span>{" "}
                                {cliente.ativo ? (
                                    <span className="text-green-600 flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-1" /> Ativo
                                    </span>
                                ) : (
                                    <span className="text-red-600 flex items-center">
                                        <XCircle className="w-4 h-4 mr-1" /> Inativo
                                    </span>
                                )}
                            </p>
                        </div>
                    </section>

                    {/* Documentação */}
                    <section>
                        <h2 className="text-xl font-semibold text-[#d4af37] mb-3 border-b pb-2">
                            Documentação Entregue
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(cliente.documentacao || {}).map(([key, doc]) => (
                                <div
                                    key={key}
                                    className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50"
                                >
                                    <h3 className="font-semibold text-gray-800 mb-2 capitalize">
                                        {key.replaceAll("_", " ")}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Entregue:</span>{" "}
                                        {doc.entregue ? "Sim" : "Não"}
                                    </p>
                                    {doc.data_recebimento && (
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Data:</span> {doc.data_recebimento}
                                        </p>
                                    )}
                                    {doc.observacoes && (
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Obs:</span> {doc.observacoes}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
