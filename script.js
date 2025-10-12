document.addEventListener('DOMContentLoaded', () => {
    const noticiasContainer = document.getElementById('noticias-container');
    const moreNewsContainer = document.getElementById('more-news-container');
    const themeToggle = document.getElementById('theme-toggle');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('close-modal');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    // Função para obter notícias reais usando NewsAPI
    async function fetchRealNews() {
        try {
            // Using NewsAPI.org for Brazilian news in Portuguese
            const apiKey = '4a5a4e6d8b8c4e4f9e2a3b1c5d6e7f8g'; // You need to replace with actual API key
            const response = await fetch(`https://newsapi.org/v2/top-headlines?country=br&language=pt&apiKey=${apiKey}`);
            
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            const data = await response.json();
            return data.articles.slice(0, 12); // Get first 12 articles
        } catch (error) {
            console.log('Erro ao buscar notícias da API, usando feed RSS como backup...');
            return await fetchNewsFromRSS();
        }
    }

    // Função alternativa usando RSS Feed (backup)
    async function fetchNewsFromRSS() {
        try {
            // Using RSS2JSON service to parse G1 RSS feed
            const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://g1.globo.com/rss/g1/');
            const data = await response.json();
            
            return data.items.slice(0, 12).map(item => ({
                title: item.title,
                description: item.description.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
                content: item.content.replace(/<[^>]*>/g, ''),
                publishedAt: new Date(item.pubDate).toLocaleDateString('pt-BR'),
                url: item.link,
                urlToImage: item.enclosure ? item.enclosure.link : null
            }));
        } catch (error) {
            console.log('Erro ao buscar RSS, usando notícias locais...');
            return [];
        }
    }

    // Função para carregar notícias
    async function loadNews() {
        try {
            const realNews = await fetchRealNews();
            
            if (realNews.length === 0) {
                // Fallback to local news if API fails
                const response = await fetch('artigos.json');
                const localNews = await response.json();
                displayNews(localNews, noticiasContainer);
                return;
            }

            // Split news between main container and more news container
            const mainNews = realNews.slice(0, 6);
            const additionalNews = realNews.slice(6, 12);
            
            displayRealNews(mainNews, noticiasContainer);
            displayRealNews(additionalNews, moreNewsContainer);
            
        } catch (error) {
            console.error('Erro ao carregar notícias:', error);
            // Fallback to local content
            fetch('artigos.json')
                .then(response => response.json())
                .then(noticias => displayNews(noticias, noticiasContainer));
        }
    }

    // Função para exibir notícias reais
    function displayRealNews(articles, container) {
        articles.forEach((article, index) => {
            const noticiaDiv = document.createElement('div');
            noticiaDiv.classList.add('noticia');
            
            const imageHtml = article.urlToImage ? 
                `<img src="${article.urlToImage}" alt="${article.title}" class="news-image" onerror="this.style.display='none'">` : '';
            
            noticiaDiv.innerHTML = `
                ${imageHtml}
                <h2>${article.title}</h2>
                <p class="data">${article.publishedAt}</p>
                <p class="noticia-resumo">${article.description}</p>
                <button class="ler-mais-btn" data-url="${article.url}" data-content="${encodeURIComponent(article.content || article.description)}">Ler Mais</button>
            `;
            
            container.appendChild(noticiaDiv);
        });
    }

    // Função para exibir notícias locais (fallback)
    function displayNews(noticias, container) {
        noticias.forEach(noticia => {
            const noticiaDiv = document.createElement('div');
            noticiaDiv.classList.add('noticia');
            
            noticiaDiv.innerHTML = `
                <h2>${noticia.titulo}</h2>
                <p class="data">${noticia.data}</p>
                <p class="noticia-resumo">${noticia.resumo}</p>
                <button class="ler-mais-btn" data-id="${noticia.id}">Ler Mais</button>
            `;
            
            container.appendChild(noticiaDiv);
        });
    }

    // Carregar notícias ao inicializar
    loadNews();
    
    // Função para exibir o modal com o conteúdo completo
    noticiasContainer.addEventListener('click', handleNewsClick);
    moreNewsContainer.addEventListener('click', handleNewsClick);
    
    function handleNewsClick(event) {
        if (event.target.classList.contains('ler-mais-btn')) {
            const button = event.target;
            
            if (button.dataset.url) {
                // For real news, show content in modal or redirect
                const content = decodeURIComponent(button.dataset.content);
                const url = button.dataset.url;
                
                modalBody.innerHTML = `
                    <div class="news-content">
                        <p>${content}</p>
                        <p><strong>Leia a notícia completa no site original:</strong></p>
                        <a href="${url}" target="_blank" rel="noopener noreferrer" class="external-link">Abrir notícia completa</a>
                    </div>
                `;
                modalOverlay.style.display = 'flex';
            } else {
                // For local news (fallback)
                const noticiaId = button.dataset.id;
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
        }
    }

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
});
