import { usersDB, updateUsersStorage } from './main.js';
import { showCatalog } from './catalog.js';

export function showProfileSelection(username, isManageMode = false) {
    const user = usersDB[username];
    let modal = document.getElementById('profileModal');

    if (modal) {
        modal.remove();
    }
    
    modal = document.createElement('div');
    modal.id = 'profileModal';
    modal.className = 'modal';
    document.body.appendChild(modal);

    const content = document.createElement('div');
    content.className = 'modal-content profile-modal-content';
    
    const header = document.createElement('div');
    header.className = 'profile-header';
    const title = document.createElement('h1');
    title.textContent = isManageMode ? 'Gerenciar Perfis' : 'Quem está assistindo?';
    header.appendChild(title);
    
    const grid = document.createElement('div');
    grid.className = 'profiles-grid';
    
    user.profiles.forEach(p => {
        const card = document.createElement('div');
        card.className = `profile-card ${isManageMode ? 'manage-mode' : ''}`;
        card.dataset.id = p.id;
        card.innerHTML = `<div class="profile-avatar"><img src="${p.avatarUrl}" alt="Avatar de ${p.name}"></div><div class="profile-name">${p.name}</div>`;
        grid.appendChild(card);
    });
    
    if (isManageMode && user.profiles.length < 5) {
        const addCard = document.createElement('div');
        addCard.className = 'profile-card add-profile-card';
        addCard.id = 'addProfile';
        addCard.textContent = '+';
        grid.appendChild(addCard);
    }
    
    const actions = document.createElement('div');
    actions.className = 'profile-actions';
    const btn = document.createElement('button');
    btn.className = 'manage-profiles-btn';
    btn.textContent = isManageMode ? 'Concluir' : 'Gerenciar Perfis';
    actions.appendChild(btn);
    
    content.appendChild(header);
    content.appendChild(grid);
    content.appendChild(actions);
    modal.appendChild(content);

    modal.style.display = 'flex';

    modal.querySelectorAll('.profile-card').forEach(card => {
        card.onclick = () => {
            if (card.id === 'addProfile') return openEditForm(username);
            const id = parseInt(card.dataset.id);
            isManageMode ? openEditForm(username, id) : selectProfile(username, id);
        };
    });

    modal.querySelector('.manage-profiles-btn').onclick = () => showProfileSelection(username, !isManageMode);
}

function selectProfile(username, profileId) {
    const profile = usersDB[username].profiles.find(p => p.id === profileId);
    document.getElementById('profileModal').style.display = 'none';
    showCatalog(profile, username);
}

function openEditForm(username, profileId = null) {
    const user = usersDB[username];
    const defaultAvatar = 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png';
    const profile = profileId ? user.profiles.find(p => p.id === profileId) : { name: '', avatarUrl: defaultAvatar, isKid: false };

    const editHtml = `
        <div id="editModal" class="modal" style="display:flex; z-index:2000">
            <div class="modal-content" style="max-width: 400px; padding: 20px;">
                <h2>${profileId ? 'Editar' : 'Novo'} Perfil</h2>
                <div class="form-group">
                    <label>Nome:</label>
                    <input type="text" id="editNameInput" value="${profile.name}" placeholder="Ex: Maria" required>
                </div>
                <div class="form-group">
                    <label>URL do Avatar:</label>
                    <input type="text" id="editAvatarInput" value="${profile.avatarUrl}" placeholder="https://...">
                </div>
                <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
                    <input type="checkbox" id="editIsKidInput" ${profile.isKid ? 'checked' : ''} style="width: auto;"> Perfil Infantil
                </label>
                <div class="profile-edit-actions">
                    <button id="saveProfileBtn" class="login-btn">Salvar</button>
                    ${profileId ? '<button id="deleteProfileBtn" class="login-btn delete-profile-btn">Excluir</button>' : ''}
                    <button onclick="this.closest('.modal').remove()" class="cta-button secondary-button">Sair</button>
                </div>
            </div>
        </div>`;
    
    document.body.insertAdjacentHTML('beforeend', editHtml);

    document.getElementById('saveProfileBtn').onclick = () => {
        const name = document.getElementById('editNameInput').value.trim();
        const avatarUrl = document.getElementById('editAvatarInput').value.trim() || defaultAvatar;
        const isKid = document.getElementById('editIsKidInput').checked;

        if (!name) return alert('Por favor, insira um nome.');

        const data = { name, avatarUrl, isKid };

        if (profileId) {
            const idx = user.profiles.findIndex(p => p.id === profileId);
            user.profiles[idx] = { ...user.profiles[idx], ...data };
        } else {
            user.profiles.push({ id: Date.now(), ...data, myList: [] });
        }
        updateUsersStorage();
        document.getElementById('editModal').remove();
        showProfileSelection(username, true);
    };

    if (profileId) {
        document.getElementById('deleteProfileBtn').onclick = () => {
            if (user.profiles.length <= 1) {
                alert('Você deve ter pelo menos um perfil ativo.');
                return;
            }
            if (!confirm('Tem certeza que deseja excluir este perfil?')) return;
            
            user.profiles = user.profiles.filter(p => p.id !== profileId);
            updateUsersStorage();
            document.getElementById('editModal').remove();
            showProfileSelection(username, true);
        };
    }
}