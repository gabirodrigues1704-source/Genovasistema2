import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import Dashboard from '@/pages/Dashboard';
import Clientes from '@/pages/Clientes';
import Honorarios from '@/pages/Honorarios';
import { Toaster } from '@/components/ui/toaster';

function App() {
    return (
        <Router>
            <Helmet>
                <title>Gênova Contabilidade - Sistema de Gestão</title>
                <meta name="description" content="Sistema completo de gestão contábil para escritórios de contabilidade" />
            </Helmet>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/clientes" element={<Clientes />} />
                        <Route path="/honorarios" element={<Honorarios />} />
                    </Routes>
                </main>
                <Toaster />
            </div>
        </Router>
    );
}

export default App;