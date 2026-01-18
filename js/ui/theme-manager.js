// Theme Manager - handles dark/light/beige mode switching
const ThemeManager = (function() {
    const STORAGE_KEY = 'comfyui-sui-theme';
    const THEMES = ['beige', 'dark', 'light'];
    const DEFAULT_THEME = 'beige';

    let currentTheme = DEFAULT_THEME;
    let store = null;

    // Initialize localforage store
    function initStore() {
        if (!store) {
            store = localforage.createInstance({
                name: 'ComfyUISUI_Settings',
                storeName: 'themeSettings'
            });
        }
        return store;
    }

    // Get saved theme from storage
    async function getSavedTheme() {
        try {
            initStore();
            const theme = await store.getItem(STORAGE_KEY);
            return theme && THEMES.includes(theme) ? theme : DEFAULT_THEME;
        } catch (error) {
            console.error('Error getting saved theme:', error);
            return DEFAULT_THEME;
        }
    }

    // Save theme to storage
    async function saveTheme(theme) {
        try {
            initStore();
            await store.setItem(STORAGE_KEY, theme);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    }

    // Apply theme to document
    function applyTheme(theme) {
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);

        // Update theme option buttons
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    // Set theme and save
    async function setTheme(theme) {
        if (!THEMES.includes(theme)) {
            theme = DEFAULT_THEME;
        }
        applyTheme(theme);
        await saveTheme(theme);
    }

    // Toggle between themes
    async function toggleTheme() {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        await setTheme(newTheme);
    }

    // Get current theme
    function getTheme() {
        return currentTheme;
    }

    // Initialize theme manager
    async function init() {
        const savedTheme = await getSavedTheme();
        applyTheme(savedTheme);
        setupEventListeners();
    }

    // Setup event listeners
    function setupEventListeners() {
        // Settings modal open/close
        const openBtn = document.getElementById('btnOpenSettings');
        const closeBtn = document.getElementById('btnCloseSettings');
        const overlay = document.getElementById('settingsModalOverlay');

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                overlay.classList.add('active');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                overlay.classList.remove('active');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                }
            });
        }

        // Theme buttons
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', () => {
                setTheme(btn.dataset.theme);
            });
        });

        // Language buttons in modal
        document.querySelectorAll('.lang-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                setLanguage(lang);
            });
        });

        // Sidebar language dropdown (custom dropdown)
        const sidebarLangDropdown = document.getElementById('sidebarLangDropdown');
        const sidebarLangBtn = document.getElementById('sidebarLangBtn');

        if (sidebarLangBtn && sidebarLangDropdown) {
            // Toggle dropdown on button click
            sidebarLangBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                sidebarLangDropdown.classList.toggle('open');
            });

            // Handle language option selection
            sidebarLangDropdown.querySelectorAll('.language-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const lang = option.dataset.lang;
                    setLanguage(lang);
                    sidebarLangDropdown.classList.remove('open');
                });
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!sidebarLangDropdown.contains(e.target)) {
                    sidebarLangDropdown.classList.remove('open');
                }
            });
        }

        // Set initial language state
        updateLanguageUI();
    }

    // Set language and update all UI
    function setLanguage(lang) {
        if (typeof I18nManager !== 'undefined') {
            I18nManager.setLanguage(lang);
        }
        updateLanguageUI();
    }

    // Language config for dropdown display
    const LANGUAGE_CONFIG = {
        ja: { flag: 'jp', name: '日本語' },
        en: { flag: 'us', name: 'English' },
        zh: { flag: 'cn', name: '中文' }
    };

    // Update language UI elements
    function updateLanguageUI() {
        if (typeof I18nManager === 'undefined') return;

        const currentLang = I18nManager.getCurrentLanguage();
        const config = LANGUAGE_CONFIG[currentLang] || LANGUAGE_CONFIG.ja;

        // Update modal buttons
        document.querySelectorAll('.lang-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === currentLang);
        });

        // Update sidebar custom dropdown
        const sidebarLangDropdown = document.getElementById('sidebarLangDropdown');
        if (sidebarLangDropdown) {
            // Update button display
            const flagSpan = sidebarLangDropdown.querySelector('.language-dropdown-btn .fi');
            const textSpan = sidebarLangDropdown.querySelector('.language-dropdown-btn .language-text');
            if (flagSpan) {
                flagSpan.className = `fi fi-${config.flag}`;
            }
            if (textSpan) {
                textSpan.textContent = config.name;
            }

            // Update selected state in options
            sidebarLangDropdown.querySelectorAll('.language-option').forEach(option => {
                option.classList.toggle('selected', option.dataset.lang === currentLang);
            });
        }
    }

    return {
        init,
        setTheme,
        getTheme,
        toggleTheme,
        THEMES
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    ThemeManager.init();
});
