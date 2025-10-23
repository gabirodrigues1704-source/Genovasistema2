import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { generateId, formatCNPJ, formatPhone, formatCEP, validateCNPJ, validateEmail } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const initialFormData = {
    nome: '',
    cnpj: '',
    cartao_cnpj: '', // 🆕 novo campo
    inscricao_estadual: '', // 🆕 novo campo
    inscricao_municipal: '', // 🆕 novo campo
    data_inicio_contabil: '', // 🆕
    endereco: '',
    cidade: '',
    cep: '',
    telefone: '',
    email: '',
    valor_honorario: '',
    dia_vencimento_honorario: '10',
    ativo: true,
    documentacao: {
        contrato_social: { entregue: false, data_recebimento: null, observacoes: '' },
        balancete: { entregue: false, data_recebimento: null, ativo_total: 0, passivo_total: 0 },
        balanco_anual: { entregue: false, data_recebimento: null, lucro_prejuizo: 0, ano_referencia: new Date().getFullYear() },
        livros_entradas_saidas: { entregue: false, data_recebimento: null, observacoes: '' }
    }
};

const DocumentationSection = ({ title, docKey, formData, handleChange, errors }) => {
    const docData = formData.documentacao[docKey];

    const handleDocChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newDocData = { ...docData };

        if (name === "entregue") {
            newDocData.entregue = checked;
            if (!checked) {
                // Reset fields when unchecked
                Object.keys(newDocData).forEach((key) => {
                    if (key !== "entregue") {
                        newDocData[key] = initialFormData.documentacao[docKey][key];
                    }
                });
            }
        } else {
            newDocData[name] = value;
        }

        handleChange({
            target: {
                name: "documentacao",
                value: { ...formData.documentacao, [docKey]: newDocData },
            },
        });
    };

    const docError = errors?.documentacao?.[docKey] || {};

    return (
        <fieldset className="border p-4 rounded-lg space-y-4">
            <div className="flex items-center mb-3">
                <input
                    type="checkbox"
                    id={`${docKey}_entregue`}
                    name="entregue"
                    checked={docData.entregue}
                    onChange={handleDocChange}
                    className="w-5 h-5 text-[#d4af37] border-gray-300 rounded focus:ring-[#d4af37]"
                    style={{ all: "revert" }}
                />
                <label
                    htmlFor={`${docKey}_entregue`}
                    className="ml-2 font-medium text-gray-800"
                >
                    {title} Entregue
                </label>
            </div>

            <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all ${!docData.entregue ? "opacity-60" : "opacity-100"
                    }`}
            >
                {/* ========== Data de Recebimento ========== */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Recebimento
                    </label>
                    <input
                        type="date"
                        name="data_recebimento"
                        value={docData.data_recebimento || ""}
                        onChange={handleDocChange}
                        disabled={!docData.entregue}
                        className={`w-full px-3 py-2 border rounded-lg ${docError.data_recebimento
                            ? "border-red-500"
                            : "border-gray-300"
                            } ${!docData.entregue ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                            }`}
                    />
                    {docError.data_recebimento && (
                        <p className="text-red-500 text-sm mt-1">
                            {docError.data_recebimento}
                        </p>
                    )}
                </div>

                {/* ========== Campos específicos por documento ========== */}
                {docKey === "contrato_social" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Observações
                        </label>
                        <input
                            type="text"
                            name="observacoes"
                            value={docData.observacoes}
                            onChange={handleDocChange}
                            disabled={!docData.entregue}
                            className={`w-full px-3 py-2 border rounded-lg ${!docData.entregue
                                ? "bg-gray-100 cursor-not-allowed"
                                : "bg-white border-gray-300"
                                }`}
                        />
                    </div>
                )}

                {docKey === "balancete" && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ativo Total
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="ativo_total"
                                value={docData.ativo_total || ""}
                                onChange={handleDocChange}
                                disabled={!docData.entregue}
                                className={`w-full px-3 py-2 border rounded-lg ${!docData.entregue
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : "bg-white border-gray-300"
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Passivo Total
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="passivo_total"
                                value={docData.passivo_total || ""}
                                onChange={handleDocChange}
                                disabled={!docData.entregue}
                                className={`w-full px-3 py-2 border rounded-lg ${!docData.entregue
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : "bg-white border-gray-300"
                                    }`}
                            />
                        </div>
                    </>
                )}

                {docKey === "balanco_anual" && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lucro/Prejuízo
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="lucro_prejuizo"
                                value={docData.lucro_prejuizo || ""}
                                onChange={handleDocChange}
                                disabled={!docData.entregue}
                                className={`w-full px-3 py-2 border rounded-lg ${!docData.entregue
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : "bg-white border-gray-300"
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ano Referência
                            </label>
                            <input
                                type="number"
                                name="ano_referencia"
                                value={docData.ano_referencia || ""}
                                onChange={handleDocChange}
                                disabled={!docData.entregue}
                                className={`w-full px-3 py-2 border rounded-lg ${docError.ano_referencia
                                    ? "border-red-500"
                                    : "border-gray-300"
                                    } ${!docData.entregue
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : "bg-white"
                                    }`}
                            />
                            {docError.ano_referencia && (
                                <p className="text-red-500 text-sm mt-1">
                                    {docError.ano_referencia}
                                </p>
                            )}
                        </div>
                    </>
                )}

                {docKey === "livros_entradas_saidas" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Observações
                        </label>
                        <input
                            type="text"
                            name="observacoes"
                            value={docData.observacoes}
                            onChange={handleDocChange}
                            disabled={!docData.entregue}
                            className={`w-full px-3 py-2 border rounded-lg ${!docData.entregue
                                ? "bg-gray-100 cursor-not-allowed"
                                : "bg-white border-gray-300"
                                }`}
                        />
                    </div>
                )}
            </div>
        </fieldset>
    );
};




const ClienteForm = ({ cliente, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const { toast } = useToast();

    useEffect(() => {
        if (cliente) {
            setFormData(prev => ({
                ...initialFormData, // Ensure all fields are present
                ...cliente,
                documentacao: {
                    ...initialFormData.documentacao,
                    ...(cliente.documentacao || {})
                }
            }));
        } else {
            setFormData(initialFormData);
        }
    }, [cliente]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'documentacao') {
            setFormData(prev => ({ ...prev, documentacao: value }));
            return;
        }

        let formattedValue = type === 'checkbox' ? checked : value;

        if (name === 'cnpj') formattedValue = formatCNPJ(value);
        else if (name === 'telefone') formattedValue = formatPhone(value);
        else if (name === 'cep') formattedValue = formatCEP(value);

        setFormData(prev => ({ ...prev, [name]: formattedValue }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = { documentacao: {} };

        // Basic client data validation
        if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
        if (!formData.cnpj.trim()) newErrors.cnpj = 'CNPJ é obrigatório';
        else if (!validateCNPJ(formData.cnpj)) newErrors.cnpj = 'CNPJ inválido';
        if (!formData.cartao_cnpj.trim()) newErrors.cartao_cnpj = 'Cartão CNPJ é obrigatório';
        if (!formData.inscricao_estadual.trim()) newErrors.inscricao_estadual = 'Inscrição Estadual é obrigatória';
        if (!formData.inscricao_municipal.trim()) newErrors.inscricao_municipal = 'Inscrição Municipal é obrigatória';
        // ======= 🆕 Validação da data de início contábil =======
        if (!formData.data_inicio_contabil) {
            newErrors.data_inicio_contabil = 'Data de início contábil é obrigatória';
        } else {
            const hoje = new Date().toISOString().split('T')[0];
            if (formData.data_inicio_contabil > hoje) {
                newErrors.data_inicio_contabil = 'A data de início não pode ser futura.';
            }
        }
        if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
        else if (!validateEmail(formData.email)) newErrors.email = 'Email inválido';
        if (!formData.valor_honorario || parseFloat(formData.valor_honorario) <= 0) newErrors.valor_honorario = 'Valor do honorário é obrigatório';

        // Documentation validation
        Object.keys(formData.documentacao).forEach(key => {
            const doc = formData.documentacao[key];
            if (doc.entregue && !doc.data_recebimento) {
                if (!newErrors.documentacao[key]) newErrors.documentacao[key] = {};
                newErrors.documentacao[key].data_recebimento = 'Data é obrigatória se entregue.';
            }
            if (key === 'balanco_anual' && doc.entregue) {
                const year = parseInt(doc.ano_referencia, 10);
                if (!year || year < 2000 || year > 2100) {
                    if (!newErrors.documentacao[key]) newErrors.documentacao[key] = {};
                    newErrors.documentacao[key].ano_referencia = 'Ano inválido (2000-2100).';
                }
            }
        });

        if (Object.keys(newErrors.documentacao).length === 0) delete newErrors.documentacao;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) {
            toast({ title: "Erro de validação", description: "Por favor, corrija os erros no formulário.", variant: "destructive" });
            return;
        }

        const clienteData = {
            ...formData,
            id: cliente?.id || generateId('cli'),
            valor_honorario: parseFloat(formData.valor_honorario),
            dia_vencimento_honorario: parseInt(formData.dia_vencimento_honorario),
            created_at: cliente?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        onSave(clienteData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Info Section */}
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fields from name to active checkbox */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome/Razão Social *</label>
                    <input type="text" name="nome" value={formData.nome} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.nome ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ *</label>
                    <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} maxLength={18} className={`w-full px-4 py-2 border rounded-lg ${errors.cnpj ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>}
                </div>
                {/* 🆕 Campos adicionais */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cartão CNPJ</label>
                    <input
                        type="text"
                        name="cartao_cnpj"
                        value={formData.cartao_cnpj}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Inscrição Estadual</label>
                    <input
                        type="text"
                        name="inscricao_estadual"
                        value={formData.inscricao_estadual}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Inscrição Municipal</label>
                    <input
                        type="text"
                        name="inscricao_municipal"
                        value={formData.inscricao_municipal}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Início Contábil *</label>
                    <input
                        type="date"
                        name="data_inicio_contabil"
                        value={formData.data_inicio_contabil}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg ${errors.data_inicio_contabil ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.data_inicio_contabil && (
                        <p className="text-red-500 text-sm mt-1">{errors.data_inicio_contabil}</p>
                    )}
                </div>


                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                    <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} maxLength={15} className={`w-full px-4 py-2 border rounded-lg ${errors.telefone ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                    <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                    <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                    <input type="text" name="cep" value={formData.cep} onChange={handleChange} maxLength={9} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valor Honorário Mensal *</label>
                    <input type="number" name="valor_honorario" value={formData.valor_honorario} onChange={handleChange} step="0.01" min="0" className={`w-full px-4 py-2 border rounded-lg ${errors.valor_honorario ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.valor_honorario && <p className="text-red-500 text-sm mt-1">{errors.valor_honorario}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dia Vencimento</label>
                    <input type="number" name="dia_vencimento_honorario" value={formData.dia_vencimento_honorario} onChange={handleChange} min="1" max="31" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div className="md:col-span-2 flex items-center">
                    <input type="checkbox" name="ativo" checked={formData.ativo} onChange={handleChange} className="w-5 h-5 text-[#d4af37] border-gray-300 rounded focus:ring-[#d4af37]" />
                    <label className="ml-2 text-sm font-medium text-gray-700">Cliente Ativo</label>
                </div>
            </div>

            {/* Documentation Section */}
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 pt-4">Documentação Obrigatória</h3>
            <Accordion type="multiple" className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>Contrato Social e Alterações</AccordionTrigger>
                    <AccordionContent>
                        <DocumentationSection title="Contrato Social" docKey="contrato_social" formData={formData} handleChange={handleChange} errors={errors} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Balancete</AccordionTrigger>
                    <AccordionContent>
                        <DocumentationSection title="Balancete" docKey="balancete" formData={formData} handleChange={handleChange} errors={errors} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>Balanço Anual</AccordionTrigger>
                    <AccordionContent>
                        <DocumentationSection title="Balanço Anual" docKey="balanco_anual" formData={formData} handleChange={handleChange} errors={errors} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger>Livros de Entradas e Saídas</AccordionTrigger>
                    <AccordionContent>
                        <DocumentationSection title="Livros" docKey="livros_entradas_saidas" formData={formData} handleChange={handleChange} errors={errors} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" onClick={onCancel} variant="outline">Cancelar</Button>
                <Button type="submit" className="bg-[#d4af37] hover:bg-[#c49d2f] text-white">
                    {cliente ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
                </Button>
            </div>
        </form>
    );
};

export default ClienteForm;