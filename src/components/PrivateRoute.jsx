import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function PrivateRoute({ children }) {
    const { user } = useAuth();

    if (!user) {
        console.log("🔒 Usuário não autenticado, redirecionando para login...");
        return <Navigate to="/login" replace />;
    }

    console.log("✅ Usuário autenticado:", user);
    return children;
}
