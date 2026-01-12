const promptHistoryManager = {
    store: null,
    maxHistoryPerField: 50,
    maxImagesPerHistory: 1,
    thumbnailSize: 240,
    thumbnailQuality: 0.92,
    dropdownVisible: null,
    expandedItems: new Set(),

    init() {
        this.store = localforage.createInstance({
            name: "promptHistoryStorage",
            storeName: "promptHistory",
        });
    },

    async getHistory(fieldId) {
        try {
            const history = await this.store.getItem(fieldId);
            return history || [];
        } catch (error) {
            console.error("Failed to get history:", error);
            return [];
        }
    },

    async saveToHistory(fieldId, text, name = '') {
        if (!text || !text.trim()) return false;

        const trimmedText = text.trim();

        try {
            let history = await this.getHistory(fieldId);

            const existingIndex = history.findIndex(item => item.text === trimmedText);
            if (existingIndex !== -1) {
                history[existingIndex].timestamp = Date.now();
                history[existingIndex].useCount = (history[existingIndex].useCount || 1) + 1;
                if (name) {
                    history[existingIndex].name = name;
                }
            } else {
                history.unshift({
                    text: trimmedText,
                    timestamp: Date.now(),
                    useCount: 1,
                    pinned: false,
                    name: name || ''
                });
            }

            const pinned = history.filter(item => item.pinned);
            const unpinned = history.filter(item => !item.pinned);

            unpinned.sort((a, b) => b.timestamp - a.timestamp);

            if (unpinned.length > this.maxHistoryPerField - pinned.length) {
                unpinned.length = this.maxHistoryPerField - pinned.length;
            }

            history = [...pinned, ...unpinned];

            await this.store.setItem(fieldId, history);
            return true;
        } catch (error) {
            console.error("Failed to save history:", error);
            return false;
        }
    },

    async updateHistoryItem(fieldId, index, updates) {
        try {
            let history = await this.getHistory(fieldId);
            if (index >= 0 && index < history.length) {
                Object.assign(history[index], updates);
                history[index].timestamp = Date.now();
                await this.store.setItem(fieldId, history);
            }
            return history;
        } catch (error) {
            console.error("Failed to update history item:", error);
            return [];
        }
    },

    async deleteHistoryItem(fieldId, index) {
        try {
            let history = await this.getHistory(fieldId);
            if (index >= 0 && index < history.length) {
                history.splice(index, 1);
                await this.store.setItem(fieldId, history);
            }
            return history;
        } catch (error) {
            console.error("Failed to delete history item:", error);
            return [];
        }
    },

    async togglePin(fieldId, index) {
        try {
            let history = await this.getHistory(fieldId);
            if (index >= 0 && index < history.length) {
                history[index].pinned = !history[index].pinned;
                await this.store.setItem(fieldId, history);
            }
            return history;
        } catch (error) {
            console.error("Failed to toggle pin:", error);
            return [];
        }
    },

    async clearHistory(fieldId) {
        try {
            await this.store.setItem(fieldId, []);
        } catch (error) {
            console.error("Failed to clear history:", error);
        }
    },

    async addImageToHistory(fieldId, text, imageUrl) {
        if (!text || !text.trim() || !imageUrl) return false;

        const trimmedText = text.trim();

        try {
            let history = await this.getHistory(fieldId);
            const existingIndex = history.findIndex(item => item.text === trimmedText);

            if (existingIndex !== -1) {
                // Only add image if there's no existing image
                if (history[existingIndex].image) {
                    return false; // Already has an image, don't overwrite
                }
                const thumbnail = await this.createThumbnail(imageUrl);
                if (thumbnail) {
                    history[existingIndex].image = {
                        thumbnail: thumbnail,
                        fullUrl: imageUrl,
                        timestamp: Date.now()
                    };
                    await this.store.setItem(fieldId, history);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error("Failed to add image to history:", error);
            return false;
        }
    },

    async deleteImageFromHistory(fieldId, index) {
        try {
            let history = await this.getHistory(fieldId);
            if (index >= 0 && index < history.length && history[index].image) {
                delete history[index].image;
                await this.store.setItem(fieldId, history);
            }
            return history;
        } catch (error) {
            console.error("Failed to delete image from history:", error);
            return [];
        }
    },

    async createThumbnail(imageUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const size = this.thumbnailSize;
                    const scale = Math.min(size / img.width, size / img.height);
                    canvas.width = Math.round(img.width * scale);
                    canvas.height = Math.round(img.height * scale);
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', this.thumbnailQuality));
                } catch (e) {
                    console.error("Failed to create thumbnail:", e);
                    resolve(null);
                }
            };
            img.onerror = () => resolve(null);
            img.src = imageUrl;
        });
    },

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return I18nManager.t('history.yesterday');
        } else if (diffDays < 7) {
            return `${diffDays}${I18nManager.t('history.daysAgo')}`;
        } else {
            return date.toLocaleDateString();
        }
    },

    truncateText(text, maxLength = 300) {
        // Keep multiple lines for better display
        const lines = text.split('\n').slice(0, 6);
        let result = lines.join('\n');
        if (result.length > maxLength) {
            result = result.substring(0, maxLength) + '...';
        } else if (text.split('\n').length > 6) {
            result += '...';
        }
        return result;
    },

    setupHistoryButton(textareaId) {
        const textarea = document.getElementById(textareaId);
        if (!textarea) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'prompt-history-wrapper';
        textarea.parentNode.insertBefore(wrapper, textarea);
        wrapper.appendChild(textarea);

        // Save button
        const saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.className = 'prompt-history-save-btn';
        saveBtn.textContent = I18nManager.t('history.save');
        saveBtn.title = I18nManager.t('history.saveToHistory');
        wrapper.appendChild(saveBtn);

        // History button
        const historyBtn = document.createElement('button');
        historyBtn.type = 'button';
        historyBtn.className = 'prompt-history-btn';
        historyBtn.textContent = I18nManager.t('history.historyButton');
        historyBtn.title = I18nManager.t('history.showHistory');
        wrapper.appendChild(historyBtn);

        const dropdown = document.createElement('div');
        dropdown.className = 'prompt-history-dropdown';
        dropdown.style.display = 'none';
        wrapper.appendChild(dropdown);

        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (textarea.value.trim()) {
                const success = await this.saveToHistory(textareaId, textarea.value);
                if (success) {
                    saveBtn.textContent = '✓';
                    setTimeout(() => {
                        saveBtn.textContent = I18nManager.t('history.save');
                    }, 1000);
                }
            }
        });

        historyBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (this.dropdownVisible && this.dropdownVisible !== dropdown) {
                this.dropdownVisible.style.display = 'none';
            }

            if (dropdown.style.display === 'none') {
                this.expandedItems.clear();
                await this.renderDropdown(dropdown, textareaId, textarea);
                dropdown.style.display = 'block';
                this.dropdownVisible = dropdown;

                // Position the dropdown using fixed positioning
                const btnRect = historyBtn.getBoundingClientRect();
                const dropdownWidth = 600;
                const dropdownHeight = dropdown.offsetHeight;
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                // Calculate left position (try to align right edge with button)
                let left = btnRect.right - dropdownWidth;
                if (left < 8) {
                    left = 8;
                }
                if (left + dropdownWidth > viewportWidth - 8) {
                    left = viewportWidth - dropdownWidth - 8;
                }

                // Calculate top position (below button, or above if not enough space)
                let top = btnRect.bottom + 4;
                if (top + dropdownHeight > viewportHeight - 8) {
                    top = btnRect.top - dropdownHeight - 4;
                    if (top < 8) {
                        top = 8;
                    }
                }

                dropdown.style.left = `${left}px`;
                dropdown.style.top = `${top}px`;
            } else {
                dropdown.style.display = 'none';
                this.dropdownVisible = null;
            }
        });

        document.addEventListener('click', (e) => {
            // Don't close dropdown if edit modal is open
            const editModal = document.getElementById('prompt-history-edit-modal');
            if (editModal && editModal.contains(e.target)) {
                return;
            }
            if (!wrapper.contains(e.target) && dropdown.style.display !== 'none') {
                dropdown.style.display = 'none';
                this.dropdownVisible = null;
            }
        });
    },

    async renderDropdown(dropdown, fieldId, textarea) {
        const history = await this.getHistory(fieldId);

        if (history.length === 0) {
            dropdown.innerHTML = `<div class="prompt-history-empty">${I18nManager.t('history.noHistory')}</div>`;
            return;
        }

        const pinned = history.filter(item => item.pinned);
        const unpinned = history.filter(item => !item.pinned);

        const allExpanded = history.every((_, i) => this.expandedItems.has(`${fieldId}-${i}`));
        const expandAllText = allExpanded ? I18nManager.t('history.collapseAll') : I18nManager.t('history.expandAll');
        let html = `<div class="prompt-history-header"><span>${I18nManager.t('history.title')} (${history.length})</span><div class="prompt-history-header-actions"><button class="prompt-history-expand-all-btn">${expandAllText}</button><button class="prompt-history-clear-btn">${I18nManager.t('history.clearAll')}</button></div></div><div class="prompt-history-list">`;

        if (pinned.length > 0) {
            html += `<div class="prompt-history-section-label">📌 ${I18nManager.t('history.pinned')}</div>`;
            pinned.forEach((item) => {
                const originalIndex = history.indexOf(item);
                html += this.renderHistoryItem(item, originalIndex, fieldId);
            });
        }

        if (unpinned.length > 0) {
            if (pinned.length > 0) {
                html += `<div class="prompt-history-section-label">${I18nManager.t('history.recent')}</div>`;
            }
            unpinned.forEach((item) => {
                const originalIndex = history.indexOf(item);
                html += this.renderHistoryItem(item, originalIndex, fieldId);
            });
        }

        html += '</div>';
        dropdown.innerHTML = html;

        this.attachDropdownEvents(dropdown, fieldId, textarea, history);
    },

    attachDropdownEvents(dropdown, fieldId, textarea, history) {
        dropdown.querySelector('.prompt-history-expand-all-btn')?.addEventListener('click', async (e) => {
            e.stopPropagation();
            const allExpanded = history.every((_, i) => this.expandedItems.has(`${fieldId}-${i}`));
            if (allExpanded) {
                history.forEach((_, i) => this.expandedItems.delete(`${fieldId}-${i}`));
            } else {
                history.forEach((_, i) => this.expandedItems.add(`${fieldId}-${i}`));
            }
            await this.renderDropdown(dropdown, fieldId, textarea);
        });

        dropdown.querySelector('.prompt-history-clear-btn')?.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm(I18nManager.t('history.confirmClear'))) {
                await this.clearHistory(fieldId);
                await this.renderDropdown(dropdown, fieldId, textarea);
            }
        });

        dropdown.querySelectorAll('.prompt-history-item').forEach(item => {
            const index = parseInt(item.dataset.index);

            item.querySelector('.prompt-history-text')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const text = history[index].text;
                textarea.value = text;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                dropdown.style.display = 'none';
                this.dropdownVisible = null;
            });

            item.querySelector('.prompt-history-expand')?.addEventListener('click', async (e) => {
                e.stopPropagation();
                const key = `${fieldId}-${index}`;
                if (this.expandedItems.has(key)) {
                    this.expandedItems.delete(key);
                } else {
                    this.expandedItems.add(key);
                }
                await this.renderDropdown(dropdown, fieldId, textarea);
            });

            item.querySelector('.prompt-history-edit')?.addEventListener('click', async (e) => {
                e.stopPropagation();
                this.showEditModal(fieldId, index, history[index], dropdown, textarea);
            });

            item.querySelector('.prompt-history-pin')?.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.togglePin(fieldId, index);
                await this.renderDropdown(dropdown, fieldId, textarea);
            });

            item.querySelector('.prompt-history-delete')?.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.deleteHistoryItem(fieldId, index);
                await this.renderDropdown(dropdown, fieldId, textarea);
            });

            item.querySelector('.prompt-history-thumbnail')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const fullUrl = e.target.dataset.fullurl || e.target.src;
                if (typeof openImageModal === 'function') {
                    openImageModal(fullUrl);
                }
            });

            item.querySelector('.prompt-history-image-delete')?.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.deleteImageFromHistory(fieldId, index);
                await this.renderDropdown(dropdown, fieldId, textarea);
            });
        });
    },

    showEditModal(fieldId, index, item, dropdown, textarea) {
        const existingModal = document.getElementById('prompt-history-edit-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'prompt-history-edit-modal';
        modal.className = 'prompt-history-modal-overlay';
        modal.innerHTML = `<div class="prompt-history-modal"><div class="prompt-history-modal-header"><span>${I18nManager.t('history.edit')}</span><button class="prompt-history-modal-close">✕</button></div><div class="prompt-history-modal-body"><div class="prompt-history-modal-field"><label>${I18nManager.t('history.name')}</label><input type="text" class="prompt-history-modal-input" id="historyEditName" value="${this.escapeHtml(item.name || '')}" placeholder="${I18nManager.t('history.namePlaceholder')}"></div><div class="prompt-history-modal-field"><label>${I18nManager.t('history.content')}</label><textarea class="prompt-history-modal-textarea" id="historyEditText">${this.escapeHtml(item.text)}</textarea></div></div><div class="prompt-history-modal-footer"><button class="prompt-history-modal-btn prompt-history-modal-cancel">${I18nManager.t('common.cancel')}</button><button class="prompt-history-modal-btn prompt-history-modal-save">${I18nManager.t('history.save')}</button></div></div>`;

        document.body.appendChild(modal);

        modal.querySelector('.prompt-history-modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.prompt-history-modal-cancel').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

        modal.querySelector('.prompt-history-modal-save').addEventListener('click', async () => {
            const newName = document.getElementById('historyEditName').value.trim();
            const newText = document.getElementById('historyEditText').value.trim();
            if (newText) {
                await this.updateHistoryItem(fieldId, index, { name: newName, text: newText });
                await this.renderDropdown(dropdown, fieldId, textarea);
            }
            modal.remove();
        });
    },

    renderHistoryItem(item, index, fieldId) {
        const pinText = item.pinned ? I18nManager.t('history.unpin') : I18nManager.t('history.pin');
        const key = `${fieldId}-${index}`;
        const isExpanded = this.expandedItems.has(key);
        const displayName = item.name ? `<span class="prompt-history-name">${this.escapeHtml(item.name)}</span>` : '';
        const textContent = isExpanded ? this.escapeHtml(item.text) : this.escapeHtml(this.truncateText(item.text));
        const expandText = isExpanded ? I18nManager.t('history.collapse') : I18nManager.t('history.expand');
        const textClass = isExpanded ? 'prompt-history-text expanded' : 'prompt-history-text';
        const fullTextTooltip = this.escapeHtml(item.text).replace(/"/g, '&quot;');

        let imageHtml = `<div class="prompt-history-image-area prompt-history-no-image"><span class="prompt-history-no-image-text">${I18nManager.t('history.imageAddedOnGenerate')}</span></div>`;
        if (item.image) {
            imageHtml = `<div class="prompt-history-image-area"><img src="${item.image.thumbnail}" class="prompt-history-thumbnail" data-fullurl="${item.image.fullUrl || item.image.thumbnail}" title="${new Date(item.image.timestamp).toLocaleString()}"><button class="prompt-history-image-delete" title="${I18nManager.t('history.deleteImage')}">×</button></div>`;
        }

        return `<div class="prompt-history-item" data-index="${index}">${imageHtml}<div class="prompt-history-content">${displayName}<div class="${textClass}" title="${fullTextTooltip}">${textContent}</div><div class="prompt-history-meta"><span class="prompt-history-time">${this.formatTimestamp(item.timestamp)}</span><span class="prompt-history-actions"><button class="prompt-history-expand">${expandText}</button><button class="prompt-history-edit">${I18nManager.t('history.edit')}</button><button class="prompt-history-pin">${pinText}</button><button class="prompt-history-delete">${I18nManager.t('history.delete')}</button></span></div></div></div>`;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    setupAllHistoryButtons() {
        const targetFields = [
            'prompt',
            'negative_prompt',
            'loopPositivePrompts',
            'loopNegativePrompts',
            'i2iloopPositivePrompts',
            'i2iloopNegativePrompts',
            'i2ianglePrompts'
        ];

        targetFields.forEach(fieldId => {
            this.setupHistoryButton(fieldId);
        });
    }
};

promptHistoryManager.init();
