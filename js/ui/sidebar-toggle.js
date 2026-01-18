// Sidebar Toggle functionality
(function() {
    const STORAGE_KEY = 'sidebar-collapsed';

    function setupSidebarToggle() {
        const sidebar = document.getElementById('leftSidebar');
        const toggleBtn = document.getElementById('sidebarToggle');

        if (!sidebar || !toggleBtn) return;

        // Load saved state
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState === 'true') {
            sidebar.classList.add('collapsed');
        }

        // Set tooltips for collapsed state
        updateTooltips(sidebar);

        // Toggle click handler
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem(STORAGE_KEY, isCollapsed);
            updateToggleTitle(toggleBtn, isCollapsed);
        });

        // Initial title
        updateToggleTitle(toggleBtn, sidebar.classList.contains('collapsed'));
    }

    function updateTooltips(sidebar) {
        const buttons = sidebar.querySelectorAll('.menu-button');
        buttons.forEach(btn => {
            const label = btn.querySelector('.menu-label');
            if (label) {
                btn.setAttribute('data-tooltip', label.textContent);
            }
        });
    }

    function updateToggleTitle(btn, isCollapsed) {
        if (typeof I18nManager !== 'undefined') {
            btn.title = isCollapsed
                ? I18nManager.t('sidebar.expand')
                : I18nManager.t('sidebar.collapse');
        }
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupSidebarToggle);
    } else {
        setupSidebarToggle();
    }

    // Re-update tooltips when language changes
    if (typeof window !== 'undefined') {
        window.addEventListener('languageChanged', () => {
            const sidebar = document.getElementById('leftSidebar');
            if (sidebar) {
                updateTooltips(sidebar);
                const toggleBtn = document.getElementById('sidebarToggle');
                if (toggleBtn) {
                    updateToggleTitle(toggleBtn, sidebar.classList.contains('collapsed'));
                }
            }
        });
    }
})();
