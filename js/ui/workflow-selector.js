const workflowSelector = {
    popupElement: null,
    activeTrigger: null,

    setup() {
        document.querySelectorAll('.workflow-select').forEach((trigger) => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle(trigger);
            });
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggle(trigger);
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!this.popupElement) return;
            if (this.popupElement.contains(e.target)) return;
            if (this.activeTrigger && this.activeTrigger.contains(e.target)) return;
            this.close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
        document.addEventListener(
            'scroll',
            (e) => {
                if (this.popupElement && !this.popupElement.contains(e.target)) this.close();
            },
            true
        );
        window.addEventListener('resize', () => this.close());
        document.addEventListener('languageChanged', () => {
            this.close();
            updateWorkflowDisplays();
        });
    },

    async toggle(trigger) {
        if (this.popupElement && this.activeTrigger === trigger) {
            this.close();
            return;
        }
        await this.open(trigger);
    },

    async open(trigger) {
        this.close();

        const type = trigger.dataset.workflowType;
        if (!type) return;

        const workflows = (await comfyUIWorkflowRepository.getAllWorkflows())
            .filter((workflow) => workflow.type === type)
            .sort((a, b) => a.name.localeCompare(b.name));

        const popup = document.createElement('div');
        popup.className = 'workflow-dropdown';

        const list = document.createElement('div');
        list.className = 'workflow-dropdown-list';
        if (workflows.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'workflow-dropdown-empty';
            empty.textContent = I18nManager.t('config.noWorkflows');
            list.appendChild(empty);
        } else {
            workflows.forEach((workflow) => {
                const item = document.createElement('div');
                item.className = 'workflow-dropdown-item' + (workflow.enabled ? ' selected' : '');
                item.textContent = workflow.name;
                item.title = workflow.name;
                item.addEventListener('click', async () => {
                    this.close();
                    if (!workflow.enabled) {
                        await this.select(type, workflow.id, workflow.name);
                    }
                });
                list.appendChild(item);
            });
        }
        popup.appendChild(list);

        const footer = document.createElement('div');
        footer.className = 'workflow-dropdown-footer';
        footer.textContent = I18nManager.t('config.openWorkflowManager');
        footer.addEventListener('click', () => {
            this.close();
            openWorkflowEditor();
        });
        popup.appendChild(footer);

        document.body.appendChild(popup);
        this.popupElement = popup;
        this.activeTrigger = trigger;
        trigger.classList.add('open');
        this.position(trigger, popup);
    },

    position(trigger, popup) {
        const rect = trigger.getBoundingClientRect();
        popup.style.width = `${rect.width}px`;
        popup.style.left = `${rect.left}px`;

        const spaceBelow = window.innerHeight - rect.bottom;
        const popupHeight = popup.offsetHeight;
        if (spaceBelow < popupHeight + 8 && rect.top > spaceBelow) {
            popup.style.top = `${Math.max(4, rect.top - popupHeight - 4)}px`;
        } else {
            popup.style.top = `${rect.bottom + 4}px`;
        }
    },

    close() {
        if (this.popupElement) {
            this.popupElement.remove();
            this.popupElement = null;
        }
        if (this.activeTrigger) {
            this.activeTrigger.classList.remove('open');
            this.activeTrigger = null;
        }
    },

    async select(type, id, name) {
        const success = await comfyUIWorkflowRepository.setEnabledWorkflow(type, id);
        if (!success) {
            createToastError(I18nManager.t('toast.workflowError'), I18nManager.t('toast.workflowSwitchFailed'));
            return;
        }

        await updateWorkflowDisplays();

        // Keep the workflow editor tabs (radio buttons) in sync when it is already loaded
        if (comfyUIWorkflowEditor) {
            comfyUIWorkflowEditor.onTabEnabledChanged(type, id);
        }

        createToast(I18nManager.t('toast.workflowSwitched'), name);
    },
};
