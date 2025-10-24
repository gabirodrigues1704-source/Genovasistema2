import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (login(email, senha)) {
            toast({
                title: "Login realizado com sucesso!",
                description: "Bem-vindo(a) de volta!",
            });
        } else {
            toast({
                title: "Erro ao entrar",
                description: "Verifique seu email e senha e tente novamente.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md border border-gray-100">
                <h1 className="text-3xl font-bold text-center text-[#d4af37] mb-2">
                    Gênova Contabilidade
                </h1>
                <p className="text-center text-gray-600 mb-8">
                    Acesse o painel administrativo
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="seuemail@empresa.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Senha
                        </label>
                        <input
                            type="password"
                            placeholder="********"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center text-gray-600">
                            <input
                                type="checkbox"
                                className="mr-2 rounded border-gray-300 text-[#d4af37] focus:ring-[#d4af37]"
                            />
                            Lembrar-me
                        </label>
                        <button
                            type="button"
                            className="text-[#d4af37] hover:underline"
                            onClick={() => alert("Recuperação de senha em breve.")}
                        >
                            Esqueci minha senha
                        </button>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[#d4af37] hover:bg-[#c49d2f] text-white font-medium py-2 rounded-lg"
                    >
                        Entrar
                    </Button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-8">
                    © 2025 Gênova Contabilidade — Todos os direitos reservados
                </p>
            </div>
        </div>
    );
}
