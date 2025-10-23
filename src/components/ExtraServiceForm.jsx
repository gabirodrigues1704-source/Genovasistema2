import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ExtraServiceForm = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        descricao: '',
        valor: '',
        data: new Date().toISOString().split('T')[0]
    });

    const [errors, setErrors] = useState({});
    const { toast } = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.descricao.trim()) {
            newErrors.descricao = 'Descrição é obrigatória';
        }

        if (!formData.valor || parseFloat(formData.valor) <= 0) {
            newErrors.valor = 'Valor deve ser maior que zero';
        }

        if (!formData.data) {
            newErrors.data = 'Data é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) {
            toast({
                title: "Erro de validação",
                description: "Por favor, corrija os erros no formulário.",
                variant: "destructive"
            });
            return;
        }

        const serviceData = {
            descricao: formData.descricao,
            valor: parseFloat(formData.valor),
            data: formData.data
        };

        onSave(serviceData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição do Serviço *
                </label>
                <input
                    type="text"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Ex: Alteração Contratual"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent ${errors.descricao ? 'border-red-500' : 'border-gray-300'
                        }`}
                />
                {errors.descricao && <p className="text-red-500 text-sm mt-1">{errors.descricao}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor *
                </label>
                <input
                    type="number"
                    name="valor"
                    value={formData.valor}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent ${errors.valor ? 'border-red-500' : 'border-gray-300'
                        }`}
                />
                {errors.valor && <p className="text-red-500 text-sm mt-1">{errors.valor}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data *
                </label>
                <input
                    type="date"
                    name="data"
                    value={formData.data}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent ${errors.data ? 'border-red-500' : 'border-gray-300'
                        }`}
                />
                {errors.data && <p className="text-red-500 text-sm mt-1">{errors.data}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                    type="button"
                    onClick={onCancel}
                    variant="outline"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    className="bg-[#d4af37] hover:bg-[#c49d2f] text-white"
                >
                    Adicionar
                </Button>
            </div>
        </form>
    );
};

export default ExtraServiceForm;