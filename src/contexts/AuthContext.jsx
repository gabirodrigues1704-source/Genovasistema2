import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const login = (email, password) => {
        console.log("Tentando login com:", email, password); // 👀 Verifica o que o usuário digitou

        if (email === "admin@genova.com" && password === "123456@") {
            const newUser = { email };
            setUser(newUser);
            localStorage.setItem("user", JSON.stringify(newUser));
            console.log("✅ Login bem-sucedido! Redirecionando para /");
            navigate("/"); // 🔥 ou remova se estiver usando a opção B
            return true;
        }

        console.log("❌ Login falhou — credenciais inválidas!");
        return false;
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
