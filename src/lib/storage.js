// src/lib/storage.js

const STORAGE_KEYS = {
    CLIENTS: "genova_clients",
    HONORARIOS: "genova_honorarios",
    BACKUP: "genova_honorarios_backup",
};

export const storage = {
    // =============================
    // 🔸 CLIENTES
    // =============================

    getClients: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error loading clients:", error);
            return [];
        }
    },

    saveClients: (clients) => {
        try {
            localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
            return true;
        } catch (error) {
            console.error("Error saving clients:", error);
            return false;
        }
    },

    // =============================
    // 🔸 HONORÁRIOS
    // =============================

    getHonorarios: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.HONORARIOS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error loading honorarios:", error);
            return [];
        }
    },

    saveHonorarios: (honorarios) => {
        try {
            localStorage.setItem(
                STORAGE_KEYS.HONORARIOS,
                JSON.stringify(honorarios)
            );
            localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(honorarios));
            return true;
        } catch (error) {
            console.error("Error saving honorarios:", error);
            return false;
        }
    },

    // 🔹 Adiciona um novo honorário
    addHonorario: (novoHonorario) => {
        try {
            const honorarios = storage.getHonorarios();
            const atualizado = [...honorarios, novoHonorario];
            storage.saveHonorarios(atualizado);
            return atualizado;
        } catch (error) {
            console.error("Error adding honorario:", error);
            return [];
        }
    },

    // 🔹 Atualiza um honorário existente (ex: mudar status para “pago”)
    updateHonorario: (id, dadosAtualizados) => {
        try {
            const honorarios = storage.getHonorarios();
            const atualizados = honorarios.map((h) =>
                h.id === id ? { ...h, ...dadosAtualizados } : h
            );
            storage.saveHonorarios(atualizados);
            return atualizados;
        } catch (error) {
            console.error("Error updating honorario:", error);
            return [];
        }
    },

    // 🔹 Exclui um honorário
    deleteHonorario: (id) => {
        try {
            const honorarios = storage.getHonorarios();
            const filtrados = honorarios.filter((h) => h.id !== id);
            storage.saveHonorarios(filtrados);
            return filtrados;
        } catch (error) {
            console.error("Error deleting honorario:", error);
            return [];
        }
    },

    // =============================
    // 🔸 LIMPAR TUDO
    // =============================
    clearAll: () => {
        Object.values(STORAGE_KEYS).forEach((key) => {
            localStorage.removeItem(key);
        });
    },
};
