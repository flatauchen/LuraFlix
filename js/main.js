import { initAuth, checkActiveSession } from './auth.js';
import { showProfileSelection } from './profiles.js';

export let usersDB = {}; // Banco de dados de usuários (JSON + LocalStorage)
export let catalogDB = []; // Catálogo de filmes e séries
export const SESSION_KEY = 'luraflix_session';
export const CUSTOM_USERS_KEY = 'luraflix_db_custom';

export async function loadData() {
    try {
        const [usersRes, catalogRes] = await Promise.all([
            fetch('db/users.json'),
            fetch('db/catalogo.json')
        ]);

        if (!usersRes.ok || !catalogRes.ok) {
            throw new Error(`Erro HTTP: Usuários ${usersRes.status}, Catálogo ${catalogRes.status}`);
        }
        
        const defaultUsers = await usersRes.json();
        catalogDB = await catalogRes.json();
        
        const customUsers = JSON.parse(localStorage.getItem(CUSTOM_USERS_KEY)) || {};
        usersDB = { ...defaultUsers, ...customUsers };

        return true;
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return false;
    }
}

// Função para persistir mudanças nos usuários
export function updateUsersStorage() {
    const customUsers = JSON.parse(localStorage.getItem(CUSTOM_USERS_KEY)) || {};
    // Sincroniza o estado atual da memória para o storage
    Object.keys(usersDB).forEach(user => {
        customUsers[user] = usersDB[user];
    });
    localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(customUsers));
}

document.addEventListener('DOMContentLoaded', async () => {
    // Inicializa a interface de autenticação (modais) imediatamente
    initAuth();

    const success = await loadData();
    if (success) {
        const session = checkActiveSession();
        if (session && usersDB[session.username]) {
            showProfileSelection(session.username);
        }
    }
    
    console.log('LuraFlix Modular Inicializado');
});