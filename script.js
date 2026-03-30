// LuraFlix - JavaScript para funcionalidades da página inicial

document.addEventListener('DOMContentLoaded', function() {
    // Modal de Login
    const modal = document.getElementById('loginModal');
    const loginButton = document.querySelector('.cta-button');
    
    const registerModal = document.getElementById('registerModal');
    const registerButton = document.getElementById('openRegister');
    const closeRegisterBtn = document.getElementById('closeRegister');
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');

    // Configurações de Armazenamento (LocalStorage)
    const SESSION_KEY = 'luraflix_session';
    const CUSTOM_USERS_KEY = 'luraflix_db_custom';

    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    // Abrir modal
    if (loginButton) {
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    if (registerButton) {
        registerButton.addEventListener('click', function(e) {
            e.preventDefault();
            registerModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeRegisterBtn) {
        closeRegisterBtn.addEventListener('click', function() {
            registerModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Fechar modal
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            loginForm.reset();
            loginMessage.innerHTML = '';
        });
    }

    // Fechar modal clicando fora
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            loginForm.reset();
            loginMessage.innerHTML = '';
        }
        if (e.target === registerModal) {
            registerModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Sistema de autenticação
    let usersDB = {};
    let catalogDB = [];

    // Função para carregar o banco de dados do arquivo externo
    async function loadUsersDB() {
        try {
            const [usersRes, catalogRes] = await Promise.all([
                fetch('users.json'),
                fetch('catalogo.json')
            ]);
            
            if (!usersRes.ok || !catalogRes.ok) throw new Error('Erro ao carregar arquivos de dados.');
            
            const defaultUsers = await usersRes.json();
            catalogDB = await catalogRes.json();
            
            // Carregar usuários customizados do LocalStorage e mesclar
            const customUsers = JSON.parse(localStorage.getItem(CUSTOM_USERS_KEY)) || {};
            usersDB = { ...defaultUsers, ...customUsers };

            // Verificar se já existe uma sessão ativa (Auto-login) após carregar os dados
            const activeSession = JSON.parse(localStorage.getItem(SESSION_KEY));
            if (activeSession && usersDB[activeSession.username]) {
                showProfileSelection(activeSession.username);
            }
        } catch (error) {
            console.error('Erro ao inicializar banco de dados:', error);
        }
    }

    loadUsersDB();

    // Função para Logout
    window.logout = function() {
        localStorage.removeItem(SESSION_KEY);
        location.reload(); // Recarrega para resetar o estado da página
    };

    // Função simples de hash (para demonstração)
    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Converte para 32 bits
        }
        return hash.toString(16);
    }

    // Função MD5 (implementação simplificada para demonstração)
    function md5Hash(str) {
        // Para demonstração, vamos usar uma abordagem mais simples
        // Em produção, use uma biblioteca MD5 adequada
        if (str === '123') {
            return '202cb962ac59075b964b07152d234b70'; // MD5 real de '123'
        }
        // Para outras senhas, usar hash simples (apenas para demo)
        return simpleHash(str);
    }

    // Submissão do formulário
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            // Validação básica
            if (!username || !password) {
                showMessage('Por favor, preencha todos os campos.', 'error');
                return;
            }

            // Simular loading
            const submitBtn = loginForm.querySelector('.login-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Entrando...';
            submitBtn.disabled = true;

            // Simular delay de rede
            setTimeout(() => {
                // Verificar credenciais usando hash MD5
                const hashedPassword = md5Hash(password);

                console.log('Tentativa de login:');
                console.log('Usuário:', username);
                console.log('Senha hash:', hashedPassword);
                console.log('Usuário no DB:', !!usersDB[username]);
                console.log('Hash esperado:', usersDB[username]?.password);

                if (usersDB[username] && usersDB[username].password === hashedPassword) {
                    showMessage('Login realizado com sucesso! Bem-vindo ao LuraFlix!', 'success');

                    // Salvar sessão para persistência
                    localStorage.setItem(SESSION_KEY, JSON.stringify({ username }));

                    // Simular redirecionamento após sucesso
                    setTimeout(() => {
                        modal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                        loginForm.reset();
                        loginMessage.innerHTML = '';

                        // Chamar função de seleção de perfis
                        showProfileSelection(username);
                    }, 1500);
                } else {
                    showMessage('Usuário ou senha incorretos.', 'error');
                    console.log('Login falhou - credenciais inválidas');
                }

                // Restaurar botão
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1000);
        });
    }

    // Submissão do Registro
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('regUsername').value.trim().toLowerCase();
            const password = document.getElementById('regPassword').value;
            const profilesInput = document.getElementById('regProfiles').value;

            if (usersDB[username]) {
                showRegisterMessage('Este usuário já existe.', 'error');
                return;
            }

            // Criar array de perfis a partir da string
            const profileNames = profilesInput.split(',').map(name => name.trim()).filter(name => name !== '');
            const profiles = profileNames.map((name, index) => ({
                id: Date.now() + index,
                name: name,
                avatarUrl: index === 0 ? 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png' : 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/e70b1333850498.56ba69ac32ae3.png',
                isKid: name.toLowerCase().includes('kids') || name.toLowerCase().includes('mika'),
                myList: []
            }));

            if (profiles.length === 0) {
                showRegisterMessage('Adicione pelo menos um nome de perfil.', 'error');
                return;
            }

            // Adicionar ao banco de dados em memória
            usersDB[username] = {
                password: md5Hash(password),
                profiles: profiles
            };

            // Persistir apenas os customizados no LocalStorage
            const customUsers = JSON.parse(localStorage.getItem(CUSTOM_USERS_KEY)) || {};
            customUsers[username] = usersDB[username];
            localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(customUsers));

            showRegisterMessage('Conta criada! Você já pode entrar.', 'success');
            
            setTimeout(() => {
                registerModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                registerForm.reset();
                modal.style.display = 'block'; // Abre o login para o usuário entrar
            }, 2000);
        });
    }

    function showRegisterMessage(message, type) {
        registerMessage.innerHTML = `<div class="message ${type}">${message}</div>`;
        registerMessage.style.display = 'block';
    }

    // Função para mostrar mensagens
    function showMessage(message, type) {
        loginMessage.innerHTML = `<div class="message ${type}">${message}</div>`;
        loginMessage.style.display = 'block';

        // Esconder mensagem após 5 segundos se for erro
        if (type === 'error') {
            setTimeout(() => {
                loginMessage.innerHTML = '';
            }, 5000);
        }
    }

    // Função para criar modal de seleção de perfis (apenas uma vez)
    function createProfileModal() {
        if (document.getElementById('profileModal')) return;

        const profileModal = document.createElement('div');
        profileModal.id = 'profileModal';
        profileModal.className = 'modal';
        profileModal.innerHTML = `
            <div class="modal-content profile-modal-content">
                <span class="close profile-close">&times;</span>
                <div class="profile-header">
                    <h1>Quem está assistindo?</h1>
                    <p>Escolha um perfil para continuar assistindo.</p>
                </div>
                <div class="profiles-grid"></div>
                <div class="profile-actions">
                    <button class="manage-profiles-btn">Gerenciar perfis</button>
                </div>
            </div>
        `;

        document.body.appendChild(profileModal);

        profileModal.querySelector('.profile-close').addEventListener('click', () => {
            hideProfileModal();
        });
    }

    function showProfileSelection(username, isManageMode = false) {
        const user = usersDB[username];
        if (!user || !user.profiles) return;

        createProfileModal();
        const profileModal = document.getElementById('profileModal');
        const profilesGrid = profileModal.querySelector('.profiles-grid');
        const title = profileModal.querySelector('.profile-header h1');
        const manageBtn = profileModal.querySelector('.manage-profiles-btn');

        title.textContent = isManageMode ? 'Gerenciar Perfis' : 'Quem está assistindo?';
        manageBtn.textContent = isManageMode ? 'Concluir' : 'Gerenciar perfis';

        let profilesHTML = user.profiles.map(profile => `
            <div class="profile-card ${isManageMode ? 'manage-mode' : ''}" data-profile-id="${profile.id}">
                <div class="profile-avatar">
                    <img src="${profile.avatarUrl}" alt="${profile.name}">
                </div>
                <div class="profile-name">${profile.name}</div>
            </div>
        `).join('');

        if (isManageMode && user.profiles.length < 5) {
            profilesHTML += `
                <div class="profile-card add-profile-card" id="addNewProfileBtn">
                    <span>+</span>
                    <div class="profile-name">Adicionar</div>
                </div>
            `;
        }

        profilesGrid.innerHTML = profilesHTML;

        profileModal.style.display = 'flex'; // Usar flex para respeitar o alinhamento central do CSS
        document.body.style.overflow = 'hidden';

        profileModal.querySelectorAll('.profile-card').forEach(card => {
            card.addEventListener('click', function() {
                if (this.id === 'addNewProfileBtn') {
                    showEditProfileForm(username);
                    return;
                }

                const profileId = parseInt(this.dataset.profileId, 10);
                if (isManageMode) {
                    showEditProfileForm(username, profileId);
                } else {
                    const profile = user.profiles.find(p => p.id === profileId);
                    if (profile) {
                        hideProfileModal();
                        showCatalog(profile, username);
                    }
                }
            });
        });

        manageBtn.onclick = () => showProfileSelection(username, !isManageMode);
    }

    function showEditProfileForm(username, profileId = null) {
        const user = usersDB[username];
        const profile = profileId ? user.profiles.find(p => p.id === profileId) : { name: '', avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png', isKid: false };

        const editModal = document.createElement('div');
        editModal.className = 'modal';
        editModal.style.display = 'flex';
        editModal.style.zIndex = '1200';
        editModal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header"><h2>${profileId ? 'Editar Perfil' : 'Adicionar Perfil'}</h2></div>
                <div class="modal-body">
                    <form id="editProfileForm">
                        <div class="form-group"><label>Nome:</label><input type="text" id="editName" value="${profile.name}" required></div>
                        <div class="form-group"><label>URL do Avatar:</label><input type="url" id="editAvatar" value="${profile.avatarUrl}" required></div>
                        <div class="form-group" style="display:flex; align-items:center; gap:10px">
                            <input type="checkbox" id="editIsKid" ${profile.isKid ? 'checked' : ''} style="width:auto">
                            <label style="margin:0">Perfil Infantil?</label>
                        </div>
                        <div class="profile-edit-actions">
                            <button type="submit" class="login-btn">Salvar</button>
                            ${profileId ? '<button type="button" class="login-btn delete-profile-btn" id="deleteProfileBtn">Excluir</button>' : ''}
                            <button type="button" class="login-btn secondary-button" onclick="this.closest('.modal').remove()">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(editModal);

        if (profileId) {
            document.getElementById('deleteProfileBtn').onclick = () => {
                if (confirm('Deseja excluir este perfil?')) {
                    user.profiles = user.profiles.filter(p => p.id !== profileId);
                    saveAndRefresh(username, editModal);
                }
            };
        }

        document.getElementById('editProfileForm').onsubmit = (e) => {
            e.preventDefault();
            const newData = {
                name: document.getElementById('editName').value,
                avatarUrl: document.getElementById('editAvatar').value,
                isKid: document.getElementById('editIsKid').checked
            };

            if (profileId) {
                const idx = user.profiles.findIndex(p => p.id === profileId);
                user.profiles[idx] = { ...user.profiles[idx], ...newData };
            } else {
                user.profiles.push({ id: Date.now(), ...newData, myList: [] });
            }
            saveAndRefresh(username, editModal);
        };
    }

    function saveAndRefresh(username, modalToRemove) {
        const customUsers = JSON.parse(localStorage.getItem(CUSTOM_USERS_KEY)) || {};
        customUsers[username] = usersDB[username];
        localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(customUsers));
        modalToRemove.remove();
        showProfileSelection(username, true);
    }

    function hideProfileModal() {
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            profileModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Função para abrir o player de vídeo
    window.openPlayer = function(itemId, profileIsKid) {
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

        // Verifica se já tem parâmetros na URL para usar ? ou &
        const videoUrl = item.videoUrl;
        const separator = videoUrl.includes('?') ? '&' : '?';

        playerModal.innerHTML = `
            <div class="modal-content player-modal-content" style="max-width: 900px; width: 95%; background: #000; border: none;">
                <span class="close close-player" onclick="closePlayer()">&times;</span>
                <div class="video-container">
                    <iframe src="${videoUrl}${separator}autoplay=1" allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
                </div>
            </div>
        `;
        playerModal.style.display = 'flex';
    };

    window.closePlayer = function() {
        const playerModal = document.getElementById('playerModal');
        if (playerModal) {
            playerModal.style.display = 'none';
            playerModal.innerHTML = '';
        }
    };

    // Helper para criar o HTML de um item de conteúdo
    function createContentCard(item, profile, username) {
        const isInList = profile.myList && profile.myList.some(fav => fav.id === item.id);
        
        return `
            <div class="content-item">
                <div class="content-image">
                    <img src="${item.thumbnailUrl}" alt="${item.title}" class="card-thumbnail" 
                         onerror="this.src='https://via.placeholder.com/320x180?text=Sem+Imagem'">
                </div>
                <div class="content-info">
                    <h3>${item.title}</h3>
                    <div class="card-controls">
                        <span class="content-type">${item.type}</span>
                        <button class="control-btn play-minimal" onclick="openPlayer(${item.id}, ${profile.isKid})" title="Play">▶</button>
                        <button class="control-btn list-minimal" onclick="toggleMyList(${item.id}, '${username}', ${profile.id})" title="Minha Lista">
                            ${isInList ? '✓' : '+'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Função para adicionar/remover da lista
    window.toggleMyList = function(itemId, username, profileId) {
        const item = catalogDB.find(i => i.id === itemId);
        const user = usersDB[username];
        const profile = user.profiles.find(p => p.id === profileId);

        const listIndex = profile.myList.findIndex(i => i.id === itemId);
        if (listIndex > -1) {
            profile.myList.splice(listIndex, 1);
        } else {
            profile.myList.push({ ...item });
        }

        // Persistir no LocalStorage (usando a lógica de usuários customizados)
        const customUsers = JSON.parse(localStorage.getItem(CUSTOM_USERS_KEY)) || {};
        customUsers[username] = user;
        localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(customUsers));

        // Atualizar interface do catálogo sem fechar
        showCatalog(profile, username);
    };

    // Função para mostrar catálogo
    function showCatalog(profile, username) {
        // Fechar modal de seleção de perfis se estiver aberto
        hideProfileModal();

        // Remover catálogo anterior se já existir
        const existingCatalog = document.getElementById('catalog');
        if (existingCatalog) {
            existingCatalog.remove();
        }

        // Ocultar conteúdo inicial
        const heroSection = document.querySelector('.hero');
        const featuresSection = document.querySelector('.features');
        const footerSection = document.querySelector('footer');
        if (heroSection) heroSection.style.display = 'none';
        if (featuresSection) featuresSection.style.display = 'none';
        if (footerSection) footerSection.style.display = 'none';

        // Criar catálogo
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
                        <a href="#" class="nav-link" onclick="logout()">Sair</a>
                    </div>
                    <div class="user-menu">
                        <div class="current-profile" id="currentProfileBtn">
                            <img src="${profile.avatarUrl}" alt="${profile.name}" class="nav-profile-img">
                            <span>${profile.name}</span>
                        </div>
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
                            : '<p style="color: #888; grid-column: 1/-1;">Sua lista está vazia. Adicione filmes e séries!</p>'}
                    </div>
                </section>

                <section class="content-section" id="section-trending">
                    <h2 class="section-title">${profile.isKid ? 'Para as crianças' : 'Em alta'}</h2>
                    <div class="content-grid">
                        ${generateContentItems(profile, username)}
                    </div>
                </section>

                <section class="content-section" id="section-recommended">
                    <h2 class="section-title">${profile.isKid ? 'Aventuras divertidas' : 'Recomendados para você'}</h2>
                    <div class="content-grid">
                        ${generateContentItems(profile, username, true)}
                    </div>
                </section>
            </main>
        `;

        document.body.appendChild(catalog);

        // Lógica do Carrossel Hero
        const heroData = catalogDB
            .filter(item => item.isKid === profile.isKid)
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);

        let currentHeroIndex = 0;
        let isHeroMuted = true;

        // Função global para alternar o som do Hero
        window.toggleHeroMute = function() {
            isHeroMuted = !isHeroMuted;
            // Decrementar o index para repetir o mesmo item mas com o novo estado de som
            currentHeroIndex = (currentHeroIndex - 1 + heroData.length) % heroData.length;
            updateHero();
        };

        function updateHero() {
            const itemIndex = currentHeroIndex;
            const item = heroData[itemIndex];
            const videoContainer = document.getElementById('heroVideoContainer');
            const infoOverlay = document.getElementById('heroInfoOverlay');
            
            if (!videoContainer || !infoOverlay) return;

            const separator = item.videoUrl.includes('?') ? '&' : '?';
            const isInList = profile.myList && profile.myList.some(fav => fav.id === item.id);
            
            // Atualiza o Vídeo (Injetando parâmetro de som baseado no estado)
            videoContainer.innerHTML = `
                <iframe src="${item.videoUrl}${separator}autoplay=1&mute=${isHeroMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&start=15&end=30&vq=hd720" 
                        frameborder="0" allow="autoplay"></iframe>
            `;

            // Atualiza as informações (Título e Botões)
            infoOverlay.innerHTML = `
                <div class="hero-info-overlay">
                    <div class="hero-info-title">${item.title}</div>
                    <div class="hero-info-controls">
                        <button class="control-btn" onclick="toggleHeroMute()" title="${isHeroMuted ? 'Ativar som' : 'Mudar para mudo'}">
                            ${isHeroMuted ? '🔇' : '🔊'}
                        </button>
                        <button class="control-btn" onclick="toggleMyList(${item.id}, '${username}', ${profile.id})" title="Minha Lista">
                            ${isInList ? '✓' : '+'}
                        </button>
                        <button class="cta-button" style="padding: 8px 20px; font-size: 1rem;" onclick="openPlayer(${item.id}, ${profile.isKid})">
                            ▶ Assistir
                        </button>
                    </div>
                </div>
            `;

            // Atualiza pontos de paginação
            const dots = catalog.querySelectorAll('.pagination-dot');
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === itemIndex);
            });

            currentHeroIndex = (currentHeroIndex + 1) % heroData.length;
        }

        // Inicia o carrossel e cria os pontos de paginação
        const pagination = catalog.querySelector('#heroPagination');
        if (pagination) {
            pagination.innerHTML = heroData.map(() => '<span class="pagination-dot"></span>').join('');
        }

        updateHero();
        heroInterval = setInterval(updateHero, 15000);

        // Eventos dos botões de navegação
        catalog.querySelector('#prevHeroBtn').onclick = () => {
            cleanupCarousel();
            currentHeroIndex = (currentHeroIndex - 2 + heroData.length) % heroData.length;
            updateHero();
            heroInterval = setInterval(updateHero, 15000);
        };

        catalog.querySelector('#nextHeroBtn').onclick = () => {
            cleanupCarousel();
            updateHero();
            heroInterval = setInterval(updateHero, 15000);
        };

        // Limpar intervalo quando o catálogo for removido ou mudar de aba
        const cleanupCarousel = () => {
            if (heroInterval) {
                clearInterval(heroInterval);
                heroInterval = null;
            }
        };

        // Lógica de navegação interna do catálogo
        const navLinks = catalog.querySelectorAll('.nav-link');
        const sections = catalog.querySelectorAll('.content-section');
        const catalogHero = catalog.querySelector('.hero-section');

        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const target = this.dataset.target;
                if (!target) return; // Ignora o link de Sair (que tem onclick)

                e.preventDefault();
                
                // Atualiza classe ativa nos links
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');

                const filterMapping = { 'series': 'Série', 'movies': 'Filme' };

                if (target === 'mylist') {
                    // Mostra apenas a seção "Minha Lista"
                    catalogHero.style.display = 'none';
                    cleanupCarousel();
                    sections.forEach(s => s.style.display = s.id === 'section-mylist' ? 'block' : 'none');
                } else if (target === 'home') {
                    // Mostra tudo (visão inicial)
                    catalogHero.style.display = 'flex';
                    if (!heroInterval) heroInterval = setInterval(updateHero, 15000);
                    sections.forEach(s => s.style.display = 'block');
                    
                    // Restaura títulos e conteúdos originais
                    catalog.querySelector('#section-trending .section-title').textContent = profile.isKid ? 'Para as crianças' : 'Em alta';
                    catalog.querySelector('#section-recommended .section-title').textContent = profile.isKid ? 'Aventuras divertidas' : 'Recomendados para você';
                    catalog.querySelector('#section-trending .content-grid').innerHTML = generateContentItems(profile, username, false);
                    catalog.querySelector('#section-recommended .content-grid').innerHTML = generateContentItems(profile, username, true);
                } else if (filterMapping[target]) {
                    const filter = filterMapping[target];
                    const label = target === 'series' ? 'Séries' : 'Filmes';

                    catalogHero.style.display = 'none';
                    cleanupCarousel();
                    sections.forEach(s => s.style.display = s.id === 'section-mylist' ? 'none' : 'block');

                    // Atualiza títulos e filtra o conteúdo das grades
                    catalog.querySelector('#section-trending .section-title').textContent = `${label} em alta`;
                    catalog.querySelector('#section-recommended .section-title').textContent = `${label} recomendados`;
                    catalog.querySelector('#section-trending .content-grid').innerHTML = generateContentItems(profile, username, false, filter);
                    catalog.querySelector('#section-recommended .content-grid').innerHTML = generateContentItems(profile, username, true, filter);
                }
            });
        });

        // Botão perfil ativo sempre
        const currentProfileBtn = document.getElementById('currentProfileBtn');
        if (currentProfileBtn) {
            currentProfileBtn.onclick = function() {
                showProfileSelection(username);
            };
        }
    }

    // Função para gerar itens de conteúdo
    function generateContentItems(profile, username, isRecommended = false, filterType = null) {
        // Filtra o catálogo com base no perfil (Kid ou Adulto)
        let content = catalogDB.filter(item => item.isKid === profile.isKid);

        if (filterType) {
            content = content.filter(item => item.type === filterType);
        }

        const items = isRecommended ? content.slice(0, 4) : content;

        return items.map(item => createContentCard(item, profile, username)).join('');
    }

    // Animação suave ao scroll para as features
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Aplicar animação nas features
    const features = document.querySelectorAll('.feature');
    features.forEach(feature => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateY(30px)';
        feature.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(feature);
    });

    // Efeito hover melhorado no botão
    if (loginButton) {
        loginButton.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });

        loginButton.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }

    // Animação do logo
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.animation = 'fadeInUp 1s ease-out';
    }

    console.log('LuraFlix - Página inicial carregada com sucesso!');
});
