import { catalogDB } from './main.js';

/**
 * Abre o player de vídeo em um modal
 * @param {number} itemId - ID do item no catálogo
 * @param {boolean} profileIsKid - Se o perfil atual é infantil
 */
export function openPlayer(itemId, profileIsKid) {
    const item = catalogDB.find(i => i.id === itemId);
    
    if (!item || !item.videoUrl || item.videoUrl === '#') {
        alert('Trailer indisponível no momento.');
        return;
    }

    // Regra de segurança para perfil infantil
    if (profileIsKid && !item.isKid) {
        alert('Acesso Negado: Este conteúdo não é permitido para perfis infantis.');
        return;
    }
    
    let playerModal = document.getElementById('playerModal');
    if (!playerModal) {
        playerModal = document.createElement('div');
        playerModal.id = 'playerModal';
        playerModal.className = 'modal';
        document.body.appendChild(playerModal);
    }

    const videoUrl = item.videoUrl;
    const separator = videoUrl.includes('?') ? '&' : '?';

    playerModal.innerHTML = `
        <div class="modal-content player-modal-content" style="max-width: 900px; width: 95%; background: #000; border: none;">
            <span class="close close-player" id="closePlayerBtn">&times;</span>
            <div class="video-container">
                <iframe src="${videoUrl}${separator}autoplay=1" allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
            </div>
        </div>
    `;
    playerModal.style.display = 'flex';
    
    document.getElementById('closePlayerBtn').onclick = closePlayer;
}

export function closePlayer() {
    const playerModal = document.getElementById('playerModal');
    if (playerModal) {
        playerModal.style.display = 'none';
        playerModal.innerHTML = '';
    }
}

// Expondo para o escopo global para uso em templates literais (onclick)
window.openPlayer = openPlayer;
window.closePlayer = closePlayer;