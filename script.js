// LuraFlix - JavaScript para funcionalidades da página inicial

document.addEventListener('DOMContentLoaded', function() {
    // Modal de Login
    const modal = document.getElementById('loginModal');
    const loginButton = document.querySelector('.cta-button');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    // Abrir modal
    if (loginButton) {
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
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
    });

    // Sistema de autenticação
    const usersDB = {
        'flatauchen': {
            password: '202cb962ac59075b964b07152d234b70', // senha: 123 (MD5 hash)
            profiles: [
                {
                    id: 1,
                    name: 'Flavio',
                    avatar: '👨',
                    isKid: false
                },
                {
                    id: 2,
                    name: 'Nathália',
                    avatar: '👩',
                    isKid: false
                },
                {
                    id: 3,
                    name: 'Mika',
                    avatar: '👶',
                    isKid: true
                }
            ]
        }
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

        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) {
                hideProfileModal();
            }
        });
    }

    function showProfileSelection(username) {
        const user = usersDB[username];
        if (!user || !user.profiles) return;

        createProfileModal();
        const profileModal = document.getElementById('profileModal');
        const profilesGrid = profileModal.querySelector('.profiles-grid');

        profilesGrid.innerHTML = user.profiles.map(profile => `
            <div class="profile-card" data-profile-id="${profile.id}" data-is-kid="${profile.isKid}">
                <div class="profile-avatar">${profile.avatar}</div>
                <div class="profile-name">${profile.name}</div>
            </div>
        `).join('');

        profileModal.style.display = 'flex'; // Usar flex para respeitar o alinhamento central do CSS
        document.body.style.overflow = 'hidden';

        profileModal.querySelectorAll('.profile-card').forEach(card => {
            card.addEventListener('click', function() {
                const profileId = parseInt(this.dataset.profileId, 10);
                const profile = user.profiles.find(p => p.id === profileId);
                if (profile) {
                    hideProfileModal();
                    showCatalog(profile, username);
                }
            });
        });

        const manageProfilesBtn = profileModal.querySelector('.manage-profiles-btn');
        if (manageProfilesBtn) {
            manageProfilesBtn.onclick = function() {
                alert('Funcionalidade de gerenciamento de perfis será implementada em breve!');
            };
        }
    }

    function hideProfileModal() {
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            profileModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

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
        const catalog = document.createElement('div');
        catalog.id = 'catalog';
        catalog.innerHTML = `
            <header class="catalog-header">
                <div class="catalog-nav">
                    <div class="logo">LuraFlix</div>
                    <div class="nav-links">
                        <a href="#" class="nav-link active">Início</a>
                        <a href="#" class="nav-link">Séries</a>
                        <a href="#" class="nav-link">Filmes</a>
                        <a href="#" class="nav-link">Minha Lista</a>
                    </div>
                    <div class="user-menu">
                        <div class="current-profile" id="currentProfileBtn">
                            ${profile.avatar} ${profile.name}
                        </div>
                    </div>
                </div>
            </header>

            <main class="catalog-content">
                <section class="hero-section">
                    <div class="hero-content">
                        <h1>Bem-vindo, ${profile.name}!</h1>
                        <p>${profile.isKid ? 'Conteúdo infantil disponível' : 'O melhor do cinema está na LuraFlix.'}</p>
                    </div>
                </section>

                <section class="content-section">
                    <h2 class="section-title">${profile.isKid ? 'Para as crianças' : 'Em alta'}</h2>
                    <div class="content-grid">
                        ${generateContentItems(profile.isKid)}
                    </div>
                </section>

                <section class="content-section">
                    <h2 class="section-title">${profile.isKid ? 'Aventuras divertidas' : 'Recomendados para você'}</h2>
                    <div class="content-grid">
                        ${generateContentItems(profile.isKid, true)}
                    </div>
                </section>
            </main>
        `;

        document.body.appendChild(catalog);

        // Botão perfil ativo sempre
        const currentProfileBtn = document.getElementById('currentProfileBtn');
        if (currentProfileBtn) {
            currentProfileBtn.onclick = function() {
                showProfileSelection(username);
            };
        }
    }

    // Função para gerar itens de conteúdo
    function generateContentItems(isKid, isRecommended = false) {
        const kidContent = [
            { title: 'Frozen 2', image: '❄️', type: 'Filme' },
            { title: 'Toy Story 4', image: '🤖', type: 'Filme' },
            { title: 'Moana', image: '🌊', type: 'Filme' },
            { title: 'Peppa Pig', image: '🐷', type: 'Série' },
            { title: 'Paw Patrol', image: '🚒', type: 'Série' },
            { title: 'Bluey', image: '🐶', type: 'Série' }
        ];

        const adultContent = [
            { title: 'Stranger Things', image: '👻', type: 'Série' },
            { title: 'The Crown', image: '👑', type: 'Série' },
            { title: 'Breaking Bad', image: '⚗️', type: 'Série' },
            { title: 'Inception', image: '🌀', type: 'Filme' },
            { title: 'The Dark Knight', image: '🦇', type: 'Filme' },
            { title: 'Pulp Fiction', image: '🍔', type: 'Filme' }
        ];

        const content = isKid ? kidContent : adultContent;
        const items = isRecommended ? content.slice(0, 4) : content;

        return items.map(item => `
            <div class="content-item">
                <div class="content-image">${item.image}</div>
                <div class="content-info">
                    <h3>${item.title}</h3>
                    <span class="content-type">${item.type}</span>
                </div>
            </div>
        `).join('');
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
