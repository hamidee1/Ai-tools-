document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & CONFIG ---
    let state = {
        language: localStorage.getItem('language') || 'en',
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    };
    const docElement = document.documentElement;

    // --- DOM ELEMENTS ---
    const app = document.getElementById('app');
    const headerEl = document.getElementById('main-header');
    const footerEl = document.getElementById('main-footer');
    const heroSectionEl = document.getElementById('hero-section');
    const modalContainer = document.getElementById('modal-container');
    const scrollToTopBtn = document.getElementById('scroll-to-top');

    // --- TRANSLATIONS ---
    const translations = {
        en: { siteName: "AI Tools Hub", discover: "Discover, Compare & Master AI Tools", heroSubtitle: "Your ultimate guide to finding and mastering the best AI tools for productivity, creativity, and growth.", searchAITools: "Explore Tools", tools: "Tools", totalReviews: "Total Reviews", totalCategories: "Total Categories", sponsored: "Sponsored", reviews: "Reviews", tryFree: "Try Free", features: "Features", limitations: "Limitations", close: "Close" },
        ar: { siteName: "مركز أدوات الذكاء الاصطناعي", discover: "اكتشف، قارن، وأتقن أدوات الذكاء الاصطناعي", heroSubtitle: "دليلك الشامل للعثور على أفضل أدوات الذكاء الاصطناعي وإتقانها.", searchAITools: "استكشف الأدوات", tools: "أداة", totalReviews: "مراجعة", totalCategories: "فئة", sponsored: "ممَوَّل", reviews: "المميزات", tryFree: "جرّب مجانًا", features: "المميزات", limitations: "العيوب", close: "إغلاق" }
    };
    const t = (key) => translations[state.language][key] || key;
    const tCat = (key) => {
        const catMap = { writing: "أدوات الكتابة", image: "أدوات إنشاء الصور", video: "أدوات إنشاء الفيديو", audio: "أدوات الصوت", productivity: "أدوات الإنتاجية", developer: "أدوات المطورين", '3d': "أدوات ثلاثية الأبعاد", design: "أدوات التصميم", marketing: "أدوات التسويق" };
        const enCat = key.charAt(0).toUpperCase() + key.slice(1) + ' Tools';
        return state.language === 'ar' ? (catMap[key] || key) : enCat;
    };
    const formatNumber = (num) => (num >= 1000 ? (num / 1000).toFixed(1).replace('.0', '') + 'k' : num.toString());

    // --- RANKING LOGIC ---
    const calculateRanks = () => {
        const groupedTools = {};
        toolsData.forEach(tool => {
            if (!groupedTools[tool.category]) {
                groupedTools[tool.category] = [];
            }
            // Scoring algorithm: Rating is most important, then review count (log scaled), with a bonus for sponsored.
            tool.score = (tool.rating * 5) + Math.log10(tool.reviewCount + 1) + (tool.isSponsored ? 2 : 0);
            groupedTools[tool.category].push(tool);
        });

        for (const category in groupedTools) {
            groupedTools[category].sort((a, b) => b.score - a.score);
            groupedTools[category].forEach((tool, index) => {
                tool.rank = index + 1;
            });
        }
        return groupedTools;
    };

    // --- RENDER FUNCTIONS ---
    
    const renderToolCard = (tool) => {
        const lang = state.language;
        const sponsoredTag = tool.isSponsored ? `<div class="absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm"><i class="fa-solid fa-crown fa-xs"></i><span>${t('sponsored')}</span></div>` : '';
        return `
            <div class="relative bg-light-card dark:bg-dark-card rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 flex flex-col gap-4 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 pl-8">
                <div class="rank-badge">#${tool.rank}</div>
                ${sponsoredTag}
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-2 flex-shrink-0"><img loading="lazy" alt="${tool.name[lang]}" src="${tool.logo}" class="max-h-full max-w-full object-contain"/></div>
                    <div><h3 class="text-xl font-bold text-light-text dark:text-dark-text">${tool.name[lang]}</h3><p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-1">${tool.short_description[lang]}</p></div>
                </div>
                <div class="flex items-center gap-2 text-gray-700 dark:text-gray-200"><i class="fas fa-star text-yellow-400"></i><span class="font-bold">${tool.rating}</span><span class="text-gray-500 dark:text-gray-400 text-sm">(${formatNumber(tool.reviewCount)})</span></div>
                <div class="text-sm text-gray-700 dark:text-gray-300"><strong class="font-bold">${t('pricing') || 'Pricing'}:</strong> ${tool.pricing[lang]}</div>
                <div class="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <a href="${tool.website}" target="_blank" rel="noopener noreferrer" class="flex-grow text-center bg-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"><i class="fas fa-external-link-alt"></i> ${t('tryFree')}</a>
                    <button data-tool-id="${tool.id}" class="review-btn flex-shrink-0 text-center bg-gray-200 dark:bg-gray-600 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">${t('reviews')}</button>
                </div>
            </div>`;
    };

    const renderToolsSection = () => {
        const rankedToolsByCategory = calculateRanks();
        const orderedCategories = Object.keys(rankedToolsByCategory).sort(); // Sort categories alphabetically for consistency

        let content = '';
        orderedCategories.forEach(category => {
            content += `<div class="mb-12">
                <h2 class="category-header">${tCat(category)}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                    ${rankedToolsByCategory[category].map(renderToolCard).join('')}
                </div>
            </div>`;
        });
        app.innerHTML = content;
    };

    const openModal = (toolId) => {
        const tool = toolsData.find(t => t.id === toolId);
        if (!tool) return;
        const lang = state.language;
        
        const featuresList = tool.features[lang].map(f => `<li class="flex items-start gap-3"><i class="fas fa-check-circle text-green-500 mt-1"></i><span>${f}</span></li>`).join('');
        const limitationsList = tool.limitations[lang].map(l => `<li class="flex items-start gap-3"><i class="fas fa-times-circle text-red-500 mt-1"></i><span>${l}</span></li>`).join('');

        modalContainer.innerHTML = `
            <div class="modal-backdrop" id="modal-backdrop"></div>
            <div class="modal-content">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">${tool.name[lang]} - ${t('reviews')}</h2>
                    <button id="modal-close-btn" class="text-2xl text-gray-500 hover:text-primary">&times;</button>
                </div>
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-xl font-bold mb-3 text-green-600 dark:text-green-400">${t('features')}</h3>
                        <ul class="space-y-2">${featuresList}</ul>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold mb-3 text-red-600 dark:text-red-400">${t('limitations')}</h3>
                        <ul class="space-y-2">${limitationsList}</ul>
                    </div>
                </div>
                <button id="modal-close-btn-bottom" class="w-full mt-8 bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary/90">${t('close')}</button>
            </div>
        `;
        modalContainer.classList.add('active');
        modalContainer.classList.remove('opacity-0', 'pointer-events-none');

        document.getElementById('modal-backdrop').addEventListener('click', closeModal);
        document.getElementById('modal-close-btn').addEventListener('click', closeModal);
        document.getElementById('modal-close-btn-bottom').addEventListener('click', closeModal);
    };

    const closeModal = () => {
        modalContainer.classList.remove('active');
        modalContainer.classList.add('opacity-0', 'pointer-events-none');
    };

    // --- Main render function that calls all others ---
    const renderAll = () => {
        docElement.lang = state.language;
        docElement.dir = state.language === 'ar' ? 'rtl' : 'ltr';
        // Render static parts
        headerEl.innerHTML = `<div class="container mx-auto px-4 h-16 flex justify-between items-center"><a href="#" class="flex items-center gap-3 text-2xl font-bold text-light-text dark:text-dark-text"><div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><i class="fa-solid fa-bolt text-white"></i></div><span>${t('siteName')}</span></a><div class="flex items-center gap-5"><button id="lang-switcher" class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary flex items-center gap-2"><i class="fas fa-globe"></i><span>${state.language === 'en' ? 'العربية' : 'English'}</span></button><button id="theme-toggle" class="text-xl text-gray-600 dark:text-gray-300 hover:text-primary"><i class="fas ${state.theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i></button></div></div>`;
        heroSectionEl.innerHTML = `<div class="text-center py-20 px-4 text-white relative z-10"><h1 class="text-5xl md:text-6xl font-extrabold">${t('siteName')}</h1><h2 class="text-2xl md:text-3xl font-bold text-primary mt-2">${t('discover')}</h2><p class="max-w-2xl mx-auto mt-4 text-lg text-gray-300">${t('heroSubtitle')}</p><div class="flex flex-wrap justify-center gap-8 md:gap-16 mt-10 text-left"><div class="text-center"><p class="text-4xl font-extrabold">${toolsData.length.toLocaleString()}+</p><p class="text-sm text-gray-400 font-medium">${t('tools')}</p></div><div class="text-center"><p class="text-4xl font-extrabold">${formatNumber(toolsData.reduce((s, t) => s + t.reviewCount, 0))}+</p><p class="text-sm text-gray-400 font-medium">${t('totalReviews')}</p></div><div class="text-center"><p class="text-4xl font-extrabold">${new Set(toolsData.map(t => t.category)).size}+</p><p class="text-sm text-gray-400 font-medium">${t('totalCategories')}</p></div></div><button id="hero-search-btn" class="mt-12 bg-primary text-white font-bold py-4 px-8 rounded-full text-lg hover:bg-primary/90 transition-all duration-300 shadow-lg transform hover:scale-105"><i class="fas fa-search mr-2"></i> ${t('searchAITools')}</button></div>`;
        footerEl.innerHTML = `&copy; ${new Date().getFullYear()} ${t('siteName')}. All rights reserved.`;

        // Render dynamic parts
        renderToolsSection();
        addEventListeners();
    };

    // --- EVENT LISTENERS ---
    const addEventListeners = () => {
        // Global Listeners (only need to be attached once)
        document.getElementById('lang-switcher').addEventListener('click', () => { state.language = state.language === 'en' ? 'ar' : 'en'; localStorage.setItem('language', state.language); renderAll(); });
        document.getElementById('theme-toggle').addEventListener('click', () => { state.theme = state.theme === 'light' ? 'dark' : 'light'; localStorage.setItem('theme', state.theme); docElement.classList.toggle('dark'); renderAll(); });
        document.getElementById('hero-search-btn').addEventListener('click', () => app.scrollIntoView({ behavior: 'smooth' }));
        scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        window.addEventListener('scroll', () => { window.scrollY > 400 ? scrollToTopBtn.classList.remove('opacity-0', 'pointer-events-none') : scrollToTopBtn.classList.add('opacity-0', 'pointer-events-none'); });

        // Event delegation for review buttons
        app.addEventListener('click', (e) => {
            const reviewButton = e.target.closest('.review-btn');
            if (reviewButton) {
                openModal(reviewButton.dataset.toolId);
            }
        });
    };

    // --- INITIALIZATION ---
    renderAll();
});
