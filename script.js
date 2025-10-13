document.addEventListener('DOMContentLoaded', () => {
    const noticiasContainer = document.getElementById('noticias-container');
    const themeToggle = document.getElementById('theme-toggle');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('close-modal');
    const navLinks = document.querySelectorAll('.nav-link');
    const footerLinks = document.querySelectorAll('.footer-link');
    const sections = document.querySelectorAll('.section');

    // Função para carregar as notícias (mantida como antes)
    fetch('artigos.json')
        .then(response => response.json())
        .then(noticias => {
            noticias.forEach(noticia => {
                const noticiaDiv = document.createElement('div');
                noticiaDiv.classList.add('noticia');
                
                noticiaDiv.innerHTML = `
                    <h2>${noticia.titulo}</h2>
                    <p class="data">${noticia.data}</p>
                    <p class="noticia-resumo">${noticia.resumo}</p>
                    <button class="ler-mais-btn" data-id="${noticia.id}">Ler Mais</button>
                `;
                
                noticiasContainer.appendChild(noticiaDiv);
            });
        });
    
    // Função para exibir o modal com o conteúdo completo (mantida como antes)
    noticiasContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('ler-mais-btn')) {
            const noticiaId = event.target.dataset.id;
            fetch('artigos.json')
                .then(response => response.json())
                .then(noticias => {
                    const noticia = noticias.find(n => n.id == noticiaId);
                    if (noticia) {
                        modalBody.innerHTML = `
                            <h2>${noticia.titulo}</h2>
                            <p class="data">${noticia.data}</p>
                            <p>${noticia.conteudo}</p>
                        `;
                        modalOverlay.style.display = 'flex';
                    }
                });
        }
    });

    // Função para fechar o modal (mantida como antes)
    closeModalBtn.addEventListener('click', () => {
        modalOverlay.style.display = 'none';
    });
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    });

    // Função para alternar o modo escuro (mantida como antes)
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
    });

    // Carregar preferência do modo escuro ao iniciar (mantida como antes)
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Gerenciamento das seções
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            // Remove a classe 'active' de todos os links e seções
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Adiciona a classe 'active' ao link e à seção clicada
            link.classList.add('active');
            const targetSectionId = link.dataset.section;
            document.getElementById(targetSectionId).classList.add('active');
        });
    });

    // Gerenciamento dos links do footer
    footerLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            // Remove a classe 'active' de todos os links de navegação e seções
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Encontra e ativa o link de navegação correspondente
            const targetSectionId = link.dataset.section;
            const correspondingNavLink = document.querySelector(`.nav-link[data-section="${targetSectionId}"]`);
            if (correspondingNavLink) {
                correspondingNavLink.classList.add('active');
            }
            
            // Ativa a seção correspondente
            document.getElementById(targetSectionId).classList.add('active');
        });
    });

    // Initialize ads
    try {
        (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
        console.log('AdSense não carregou ainda');
    }
});
