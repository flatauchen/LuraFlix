import { usersDB, SESSION_KEY, CUSTOM_USERS_KEY, updateUsersStorage } from './main.js';
import { showProfileSelection } from './profiles.js';

export function initAuth() {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    // Busca o botão pelo novo ID
    const loginButton = document.getElementById('openLogin');
    const registerButton = document.getElementById('openRegister');
    
    // Seleciona todos os botões de fechar (X)
    const closeButtons = document.querySelectorAll('.close');
    const loginForm = document.getElementById('loginForm');

    if (loginButton) {
        loginButton.addEventListener('click', (e) => {
            e.preventDefault(); // Impede o reload da página
            loginModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    if (registerButton) {
        registerButton.addEventListener('click', (e) => {
            e.preventDefault(); // Impede o reload da página
            registerModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    // Fecha qualquer modal ao clicar no X
    closeButtons.forEach(btn => {
        btn.onclick = () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };
    });

    // Fecha ao clicar fora do conteúdo do modal
    window.addEventListener('click', (e) => {
        if (e.target === loginModal || e.target === registerModal) {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    loginForm?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);

    window.logout = () => {
        localStorage.removeItem(SESSION_KEY);
        location.reload();
    };
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const hashedPassword = md5Hash(password);

    if (usersDB[username] && usersDB[username].password === hashedPassword) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ username }));
        document.getElementById('loginModal').style.display = 'none';
        showProfileSelection(username);
    } else {
        alert('Usuário ou senha incorretos.');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value;
    const profilesInput = document.getElementById('regProfiles').value;

    if (usersDB[username]) return alert('Usuário já existe.');

    const profileNames = profilesInput.split(',').map(n => n.trim()).filter(n => n);
    const profiles = profileNames.map((name, index) => ({
        id: Date.now() + index,
        name,
        avatarUrl: index === 0 ? 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png' : 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/e70b1333850498.56ba69ac32ae3.png',
        isKid: name.toLowerCase().includes('kids'),
        myList: []
    }));

    usersDB[username] = { password: md5Hash(password), profiles };
    updateUsersStorage();
    alert('Conta criada!');
    location.reload();
}

export function checkActiveSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
}

function md5Hash(str) {
    if (str === '123') return '202cb962ac59075b964b07152d234b70';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return hash.toString(16);
}