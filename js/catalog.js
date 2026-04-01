import { usersDB, catalogDB, CUSTOM_USERS_KEY, updateUsersStorage } from './main.js';
import { openPlayer } from './player.js';
import { showProfileSelection } from './profiles.js';

/**
 * Renderiza a interface principal do catálogo
 */
export function showCatalog(profile, username) {
    const existingCatalog = document.getElementById('catalog');
    if (existingCatalog) existingCatalog.remove();

    // Ocultar landing page original
    document.querySelector('.hero')?.setAttribute('style', 'display: none');
    document.querySelector('.features')?.setAttribute('style', 'display: none');
    document.querySelector('footer')?.setAttribute('style', 'display: none');

    let heroInterval;
    const catalog = document.createElement('div');
    catalog.id = 'catalog';
    catalog.innerHTML = `
        <header class="catalog-header">
            <div class="catalog-nav">
                <div class="logo">LuraFlix</div>
                <div class="nav-links">
                    <a href="#" class="nav-link active" data-target="home">Início</a>
                    <a href="#" class="nav-link" data-target="series">Séries</a>
                    <a href="#" class="nav-link" data-target="movies">Filmes</a>
                    <a href="#" class="nav-link" data-target="mylist">Minha Lista</a>
                    <a href="#" class="nav-link" id="logoutBtn">Sair</a>
                </div>
                <div class="search-container">
                    <input type="text" id="searchInput" placeholder="Títulos...">
                    <button class="search-btn">🔍</button>
                </div>
                <div class="current-profile" id="currentProfileBtn">
                    <img src="${profile.avatarUrl}" class="nav-profile-img">
                    <span>${profile.name}</span>
                </div>
            </div>
        </header>
        <main class="catalog-content">
            <section class="hero-section">
                <div class="hero-video-bg" id="heroVideoContainer"></div>
                <div id="heroInfoOverlay"></div>
                <button class="hero-nav-btn prev-hero" id="prevHeroBtn">❮</button>
                <button class="hero-nav-btn next-hero" id="nextHeroBtn">❯</button>
                <div class="hero-pagination" id="heroPagination"></div>
            </section>
            <section class="content-section" id="section-mylist">
                <h2 class="section-title">Minha Lista</h2>
                <div class="content-grid">
                    ${profile.myList && profile.myList.length > 0 
                        ? profile.myList.map(item => createContentCard(item, profile, username)).join('')
                        : '<p style="color: #888; grid-column: 1/-1;">Sua lista está vazia.</p>'}
                </div>
            </section>
            <section class="content-section" id="section-search" style="display: none;">
                <h2 class="section-title">Resultados da busca</h2>
                <div class="content-grid" id="searchGrid"></div>
            </section>
            <section class="content-section" id="section-trending">
                <h2 class="section-title">${profile.isKid ? 'Para as crianças' : 'Em alta'}</h2>
                <div class="content-grid">${generateContentItems(profile, username)}</div>
            </section>
            <section class="content-section" id="section-recommended">
                <h2 class="section-title">${profile.isKid ? 'Aventuras divertidas' : 'Recomendados para você'}</h2>
                <div class="content-grid">${generateContentItems(profile, username, true)}</div>
            </section>
        </main>
    `;
    document.body.appendChild(catalog);

    // --- Lógica do Hero Carousel ---
    const heroData = catalogDB.filter(item => item.isKid === profile.isKid).sort(() => 0.5 - Math.random()).slice(0, 4);
    let currentHeroIndex = 0;
    let isHeroMuted = true;

    const cleanupCarousel = () => { if (heroInterval) { clearInterval(heroInterval); heroInterval = null; } };

    window.toggleHeroMute = function() {
        isHeroMuted = !isHeroMuted;
        cleanupCarousel(); // Para o tempo para evitar pulo de vídeo imediato
        currentHeroIndex = (currentHeroIndex - 1 + heroData.length) % heroData.length;
        updateHero();
        heroInterval = setInterval(updateHero, 15000); // Reinicia o contador de 15s
    };

    function updateHero() {
        const itemIndex = currentHeroIndex;
        const item = heroData[itemIndex];
        const videoContainer = document.getElementById('heroVideoContainer');
        const infoOverlay = document.getElementById('heroInfoOverlay');
        if (!videoContainer || !infoOverlay) return;

        const separator = item.videoUrl.includes('?') ? '&' : '?';
        const isInList = profile.myList && profile.myList.some(fav => fav.id === item.id);
        
        videoContainer.innerHTML = `<iframe src="${item.videoUrl}${separator}autoplay=1&mute=${isHeroMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0&start=15&end=30&vq=hd720" frameborder="0" allow="autoplay"></iframe>`;
        infoOverlay.innerHTML = `
            <div class="hero-info-overlay">
                <div class="hero-info-title">${item.title}</div>
                <div class="hero-info-controls">
                    <button class="control-btn" onclick="toggleHeroMute()">${isHeroMuted ? '🔇' : '🔊'}</button>
                    <button class="control-btn" data-item-id="${item.id}" onclick="toggleMyList(${item.id}, '${username}', ${profile.id})">${isInList ? '✓' : '+'}</button>
                    <button class="cta-button" onclick="openPlayer(${item.id}, ${profile.isKid})">▶ Assistir</button>
                </div>
            </div>`;
        catalog.querySelectorAll('.pagination-dot').forEach((dot, idx) => dot.classList.toggle('active', idx === itemIndex));
        currentHeroIndex = (currentHeroIndex + 1) % heroData.length;
    }

    const pagination = catalog.querySelector('#heroPagination');
    if (pagination) pagination.innerHTML = heroData.map(() => '<span class="pagination-dot"></span>').join('');
    updateHero();

    heroInterval = setInterval(updateHero, 15000);

    catalog.querySelector('#prevHeroBtn').onclick = () => { cleanupCarousel(); currentHeroIndex = (currentHeroIndex - 2 + heroData.length) % heroData.length; updateHero(); heroInterval = setInterval(updateHero, 15000); };
    catalog.querySelector('#nextHeroBtn').onclick = () => { cleanupCarousel(); updateHero(); heroInterval = setInterval(updateHero, 15000); };

    // --- Navegação e Busca ---
    const sections = catalog.querySelectorAll('.content-section');
    const heroSection = catalog.querySelector('.hero-section');
    const searchInput = catalog.querySelector('#searchInput');

    catalog.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = (e) => {
            const target = link.dataset.target;
            if (!target) return;
            e.preventDefault();
            searchInput.value = '';
            catalog.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            if (target === 'mylist') {
                heroSection.style.display = 'none'; cleanupCarousel();
                sections.forEach(s => s.style.display = s.id === 'section-mylist' ? 'block' : 'none');
            } else if (target === 'home') {
                heroSection.style.display = 'flex'; if (!heroInterval) heroInterval = setInterval(updateHero, 15000);
                sections.forEach(s => s.style.display = s.id === 'section-search' ? 'none' : 'block');
            } else {
                const filter = target === 'series' ? 'Série' : 'Filme';
                heroSection.style.display = 'none'; cleanupCarousel();
                sections.forEach(s => s.style.display = (s.id === 'section-search' || s.id === 'section-mylist') ? 'none' : 'block');
                catalog.querySelector('#section-trending .content-grid').innerHTML = generateContentItems(profile, username, false, filter);
                catalog.querySelector('#section-recommended .content-grid').innerHTML = generateContentItems(profile, username, true, filter);
            }
        };
    });

    searchInput.oninput = (e) => {
        const term = e.target.value.toLowerCase().trim();
        const searchGrid = catalog.querySelector('#searchGrid');
        if (term) {
            heroSection.style.display = 'none'; cleanupCarousel();
            sections.forEach(s => s.style.display = 'none');
            const results = catalogDB.filter(i => i.isKid === profile.isKid && i.title.toLowerCase().includes(term));
            catalog.querySelector('#section-search').style.display = 'block';
            searchGrid.innerHTML = results.length ? results.map(i => createContentCard(i, profile, username)).join('') : '<p style="color: #888; grid-column: 1/-1;">Sem resultados.</p>';
        } else {
            catalog.querySelector('.nav-link.active').click();
        }
    };

    catalog.querySelector('#currentProfileBtn').onclick = () => { cleanupCarousel(); showProfileSelection(username); };
    catalog.querySelector('#logoutBtn').onclick = () => { cleanupCarousel(); window.logout(); };
}

export function generateContentItems(profile, username, isRecommended = false, filterType = null) {
    let content = catalogDB.filter(item => item.isKid === profile.isKid);
    if (filterType) content = content.filter(item => item.type === filterType);
    const items = isRecommended ? content.slice(0, 4) : content;
    return items.map(item => createContentCard(item, profile, username)).join('');
}

export function createContentCard(item, profile, username) {
    const isInList = profile.myList && profile.myList.some(fav => fav.id === item.id);
    return `
        <div class="content-item">
            <div class="content-image">
                <img src="${item.thumbnailUrl}" alt="${item.title}" class="card-thumbnail" onerror="this.src='https://via.placeholder.com/320x180?text=Sem+Imagem'">
            </div>
            <div class="content-info">
                <h3>${item.title}</h3>
                <div class="card-controls">
                    <span class="content-type">${item.type}</span>
                    <button class="control-btn play-minimal" onclick="openPlayer(${item.id}, ${profile.isKid})" title="Play">▶</button>
                    <button class="control-btn list-minimal" data-item-id="${item.id}" onclick="toggleMyList(${item.id}, '${username}', ${profile.id})" title="Minha Lista">
                        ${isInList ? '✓' : '+'}
                    </button>
                </div>
            </div>
        </div>`;
}

export function toggleMyList(itemId, username, profileId) {
    const item = catalogDB.find(i => i.id === itemId);
    const user = usersDB[username];
    const profile = user.profiles.find(p => p.id === profileId);
    const listIndex = profile.myList.findIndex(i => i.id === itemId);
    
    let added = false;
    if (listIndex > -1) {
        profile.myList.splice(listIndex, 1);
    } else {
        profile.myList.push({ ...item });
        added = true;
    }

    updateUsersStorage();

    // Atualização seletiva da UI para evitar que o carrossel mude o vídeo
    const icon = added ? '✓' : '+';
    
    // 1. Atualiza o ícone em todos os botões que possuem este ID (no Grid e no Hero)
    document.querySelectorAll(`.control-btn[data-item-id="${itemId}"]`).forEach(btn => {
        btn.textContent = icon;
    });

    // 2. Atualiza especificamente a seção "Minha Lista" para refletir a mudança
    const myListGrid = document.querySelector('#section-mylist .content-grid');
    if (myListGrid) {
        if (profile.myList.length > 0) {
            myListGrid.innerHTML = profile.myList.map(i => createContentCard(i, profile, username)).join('');
        } else {
            myListGrid.innerHTML = '<p style="color: #888; grid-column: 1/-1;">Sua lista está vazia.</p>';
        }
    }
}

window.toggleMyList = toggleMyList;