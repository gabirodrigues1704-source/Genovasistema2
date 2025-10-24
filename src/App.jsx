import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Dashboard from "@/pages/Dashboard";
import Clientes from "@/pages/Clientes";
import Honorarios from "@/pages/Honorarios";
import ClienteDetalhes from "@/pages/ClienteDetalhes"; // 🆕 Import da nova página
import Login from "@/pages/Login";
import { Toaster } from "@/components/ui/toaster";
import PrivateRoute from "@/components/PrivateRoute";

function AppContent() {
    const location = useLocation();
    const hideNavbar = location.pathname === "/login"; // 🔥 só esconde na tela de login

    return (
        <>
            <Helmet>
                <title>Gênova Contabilidade - Sistema de Gestão</title>
                <meta
                    name="description"
                    content="Sistema completo de gestão contábil para escritórios de contabilidade"
                />
            </Helmet>

            <div className="min-h-screen bg-gray-50">
                {!hideNavbar && <Navbar />} {/* 🔥 Esconde Navbar na tela de login */}

                <main className="container mx-auto px-4 py-8">
                    <Routes>
                        {/* 🔓 Rota pública */}
                        <Route path="/login" element={<Login />} />

                        {/* 🔒 Rotas protegidas */}
                        <Route
                            path="/"
                            element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/clientes"
                            element={
                                <PrivateRoute>
                                    <Clientes />
                                </PrivateRoute>
                            }
                        />

                        {/* 🆕 Nova rota de detalhes */}
                        <Route
                            path="/clientes/:id"
                            element={
                                <PrivateRoute>
                                    <ClienteDetalhes />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/honorarios"
                            element={
                                <PrivateRoute>
                                    <Honorarios />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </main>

                <Toaster />
            </div>
        </>
    );
}

export default AppContent;
