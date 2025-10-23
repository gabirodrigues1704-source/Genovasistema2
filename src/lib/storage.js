const STORAGE_KEYS = {
    CLIENTS: 'genova_clients',
    HONORARIOS: 'genova_honorarios',
    BACKUP: 'genova_honorarios_backup'
};

export const storage = {
    getClients: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading clients:', error);
            return [];
        }
    },

    saveClients: (clients) => {
        try {
            localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
            return true;
        } catch (error) {
            console.error('Error saving clients:', error);
            return false;
        }
    },

    getHonorarios: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.HONORARIOS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading honorarios:', error);
            return [];
        }
    },

    saveHonorarios: (honorarios) => {
        try {
            localStorage.setItem(STORAGE_KEYS.HONORARIOS, JSON.stringify(honorarios));
            localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(honorarios));
            return true;
        } catch (error) {
            console.error('Error saving honorarios:', error);
            return false;
        }
    },

    clearAll: () => {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
};