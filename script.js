document.addEventListener('DOMContentLoaded', () => {
    const noticiasContainer = document.getElementById('noticias-container');
    const themeToggle = document.getElementById('theme-toggle');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('close-modal');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    // Ad optimization functions
    function initializeAds() {
        // Refresh ads when content changes
        setTimeout(() => {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.log('AdSense not loaded yet');
            }
        }, 1000);
    }

    function insertInFeedAds(container, newsCount) {
        // Insert ads between news items for better integration
        const adPositions = [3, 6, 9]; // After every 3rd news item
        
        adPositions.forEach(position => {
            if (newsCount > position) {
                const adDiv = document.createElement('div');
                adDiv.className = 'ad-container in-feed-ad';
                adDiv.innerHTML = `
                    <ins class="adsbygoogle"
                         style="display:block"
                         data-ad-format="fluid"
                         data-ad-layout-key="-6t+ed+2i-1n-4w"
                         data-ad-client="ca-pub-9291553361284974"
                         data-ad-slot="5678901234"></ins>
                `;
                
                const newsItems = container.children;
                if (newsItems[position]) {
                    container.insertBefore(adDiv, newsItems[position]);
                    // Initialize this specific ad
                    try {
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    } catch (e) {
                        console.log('In-feed ad not loaded');
                    }
                }
            }
        });
    }

    // Enhanced news loading with ad integration
    fetch('artigos.json')
        .then(response => response.json())
        .then(noticias => {
            let newsCount = 0;
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
                newsCount++;
            });
            
            // Insert in-feed ads after loading all news
            insertInFeedAds(noticiasContainer, newsCount);
            
            // Initialize ads after content is loaded
            initializeAds();
        })
        .catch(error => {
            console.error('Erro ao carregar notícias:', error);
        });
    
    // Modal functionality with ad refresh
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
                            <div class="ad-container modal-ad">
                                <ins class="adsbygoogle"
                                     style="display:block; text-align:center;"
                                     data-ad-layout="in-article"
                                     data-ad-format="fluid"
                                     data-ad-client="ca-pub-9291553361284974"
                                     data-ad-slot="6789012345"></ins>
                            </div>
                            <p>${noticia.conteudo}</p>
                        `;
                        modalOverlay.style.display = 'flex';
                        
                        // Initialize modal ad
                        try {
                            (adsbygoogle = window.adsbygoogle || []).push({});
                        } catch (e) {
                            console.log('Modal ad not loaded');
                        }
                    }
                });
        }
    });

    // Close modal functionality
    closeModalBtn.addEventListener('click', () => {
        modalOverlay.style.display = 'none';
    });
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    });

    // Theme toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
    });

    // Load saved theme preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Section navigation with ad refresh
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            link.classList.add('active');
            const targetSectionId = link.dataset.section;
            document.getElementById(targetSectionId).classList.add('active');
            
            // Refresh ads when switching sections
            if (targetSectionId === 'home') {
                setTimeout(initializeAds, 500);
            }
        });
    });

    // Page visibility API for ad optimization
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            // Page became visible again, potential ad refresh
            setTimeout(initializeAds, 1000);
        }
    });

    // Lazy loading optimization for better performance
    if ('IntersectionObserver' in window) {
        const adObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const adContainer = entry.target;
                    if (!adContainer.classList.contains('ad-loaded')) {
                        adContainer.classList.add('ad-loaded');
                        // Ad is in viewport, ensure it's properly loaded
                    }
                }
            });
        });

        // Observe ad containers for viewport visibility
        setTimeout(() => {
            document.querySelectorAll('.ad-container').forEach(ad => {
                adObserver.observe(ad);
            });
        }, 2000);
    }
});
