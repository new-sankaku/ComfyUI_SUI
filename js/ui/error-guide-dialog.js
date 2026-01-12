// Error Guide Dialog - Provides detailed guidance for common errors
const ErrorGuideDialog = (function() {
    let dialogElement = null;

    // Error types with their guides
    const ERROR_TYPES = {
        COMFYUI_OFFLINE: 'comfyuiOffline',
        WORKFLOW_NOT_FOUND: 'workflowNotFound',
        WORKFLOW_NODE_MISSING: 'workflowNodeMissing',
        NETWORK_ERROR: 'networkError',
        GENERATION_ERROR: 'generationError'
    };

    function init() {
        if (dialogElement) return;
        createDialogElement();
    }

    function createDialogElement() {
        dialogElement = document.createElement('div');
        dialogElement.id = 'errorGuideModal';
        dialogElement.className = 'error-guide-modal-overlay';
        dialogElement.innerHTML = `
            <div class="error-guide-modal">
                <div class="error-guide-modal-header">
                    <span class="error-guide-modal-icon">⚠️</span>
                    <span class="error-guide-modal-title" id="errorGuideTitle"></span>
                    <button class="error-guide-modal-close" onclick="ErrorGuideDialog.close()">×</button>
                </div>
                <div class="error-guide-modal-body">
                    <div class="error-guide-message" id="errorGuideMessage"></div>
                    <div class="error-guide-section">
                        <div class="error-guide-section-title" id="errorGuideCauseTitle"></div>
                        <div class="error-guide-cause" id="errorGuideCause"></div>
                    </div>
                    <div class="error-guide-section">
                        <div class="error-guide-section-title" id="errorGuideSolutionTitle"></div>
                        <ul class="error-guide-steps" id="errorGuideSteps"></ul>
                    </div>
                    <div class="error-guide-detail" id="errorGuideDetail"></div>
                </div>
                <div class="error-guide-modal-footer">
                    <button class="error-guide-btn" id="errorGuideActionBtn" style="display:none;"></button>
                    <button class="error-guide-btn error-guide-btn-primary" onclick="ErrorGuideDialog.close()" data-i18n="errorGuide.close"></button>
                </div>
            </div>
        `;
        document.body.appendChild(dialogElement);

        // Close on overlay click
        dialogElement.addEventListener('click', function(e) {
            if (e.target === dialogElement) {
                close();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && dialogElement.classList.contains('active')) {
                close();
            }
        });
    }

    function show(errorType, options = {}) {
        init();

        const title = $('errorGuideTitle');
        const message = $('errorGuideMessage');
        const causeTitle = $('errorGuideCauseTitle');
        const cause = $('errorGuideCause');
        const solutionTitle = $('errorGuideSolutionTitle');
        const steps = $('errorGuideSteps');
        const detail = $('errorGuideDetail');
        const actionBtn = $('errorGuideActionBtn');
        const closeBtn = dialogElement.querySelector('.error-guide-btn-primary');

        // Set common section titles
        causeTitle.textContent = I18nManager.t('errorGuide.possibleCause');
        solutionTitle.textContent = I18nManager.t('errorGuide.solution');
        closeBtn.textContent = I18nManager.t('errorGuide.close');

        // Clear previous content
        steps.innerHTML = '';
        detail.textContent = '';
        detail.style.display = 'none';
        actionBtn.style.display = 'none';
        actionBtn.onclick = null;

        switch (errorType) {
            case ERROR_TYPES.COMFYUI_OFFLINE:
                title.textContent = I18nManager.t('errorGuide.comfyuiOfflineTitle');
                message.textContent = I18nManager.t('errorGuide.comfyuiOfflineMessage');
                cause.textContent = I18nManager.t('errorGuide.comfyuiOfflineCause');
                addSteps(steps, [
                    I18nManager.t('errorGuide.comfyuiOfflineStep1'),
                    I18nManager.t('errorGuide.comfyuiOfflineStep2'),
                    I18nManager.t('errorGuide.comfyuiOfflineStep3'),
                    I18nManager.t('errorGuide.comfyuiOfflineStep4')
                ]);
                break;

            case ERROR_TYPES.WORKFLOW_NOT_FOUND:
                const workflowType = options.workflowType || 'T2I';
                title.textContent = I18nManager.t('errorGuide.workflowNotFoundTitle');
                message.textContent = I18nManager.t('errorGuide.workflowNotFoundMessage').replace('{type}', workflowType);
                cause.textContent = I18nManager.t('errorGuide.workflowNotFoundCause');
                addSteps(steps, [
                    I18nManager.t('errorGuide.workflowNotFoundStep1'),
                    I18nManager.t('errorGuide.workflowNotFoundStep2').replace('{type}', workflowType),
                    I18nManager.t('errorGuide.workflowNotFoundStep3'),
                    I18nManager.t('errorGuide.workflowNotFoundStep4')
                ]);
                // Show action button to open workflows
                actionBtn.textContent = I18nManager.t('errorGuide.openWorkflows');
                actionBtn.style.display = 'inline-flex';
                actionBtn.onclick = function() {
                    close();
                    openWorkflowEditor();
                };
                break;

            case ERROR_TYPES.WORKFLOW_NODE_MISSING:
                const missingNodes = options.missingNodes || [];
                title.textContent = I18nManager.t('errorGuide.workflowNodeMissingTitle');
                message.textContent = I18nManager.t('errorGuide.workflowNodeMissingMessage');
                cause.textContent = I18nManager.t('errorGuide.workflowNodeMissingCause');
                addSteps(steps, [
                    I18nManager.t('errorGuide.workflowNodeMissingStep1'),
                    I18nManager.t('errorGuide.workflowNodeMissingStep2'),
                    I18nManager.t('errorGuide.workflowNodeMissingStep3'),
                    I18nManager.t('errorGuide.workflowNodeMissingStep4')
                ]);
                if (missingNodes.length > 0) {
                    detail.textContent = I18nManager.t('errorGuide.missingNodesList') + '\n' + missingNodes.join('\n');
                    detail.style.display = 'block';
                }
                break;

            case ERROR_TYPES.NETWORK_ERROR:
                title.textContent = I18nManager.t('errorGuide.networkErrorTitle');
                message.textContent = I18nManager.t('errorGuide.networkErrorMessage');
                cause.textContent = I18nManager.t('errorGuide.networkErrorCause');
                addSteps(steps, [
                    I18nManager.t('errorGuide.networkErrorStep1'),
                    I18nManager.t('errorGuide.networkErrorStep2'),
                    I18nManager.t('errorGuide.networkErrorStep3'),
                    I18nManager.t('errorGuide.networkErrorStep4')
                ]);
                break;

            case ERROR_TYPES.GENERATION_ERROR:
                title.textContent = I18nManager.t('errorGuide.generationErrorTitle');
                message.textContent = options.errorMessage || I18nManager.t('errorGuide.generationErrorMessage');
                cause.textContent = I18nManager.t('errorGuide.generationErrorCause');
                addSteps(steps, [
                    I18nManager.t('errorGuide.generationErrorStep1'),
                    I18nManager.t('errorGuide.generationErrorStep2'),
                    I18nManager.t('errorGuide.generationErrorStep3'),
                    I18nManager.t('errorGuide.generationErrorStep4')
                ]);
                // Show action button to open workflows for testing
                actionBtn.textContent = I18nManager.t('errorGuide.openWorkflows');
                actionBtn.style.display = 'inline-flex';
                actionBtn.onclick = function() {
                    close();
                    openWorkflowEditor();
                };
                if (options.errorDetail) {
                    detail.textContent = options.errorDetail;
                    detail.style.display = 'block';
                }
                break;

            default:
                title.textContent = I18nManager.t('errorGuide.unknownErrorTitle');
                message.textContent = options.errorMessage || I18nManager.t('errorGuide.unknownErrorMessage');
                cause.textContent = I18nManager.t('errorGuide.unknownErrorCause');
                addSteps(steps, [
                    I18nManager.t('errorGuide.unknownErrorStep1'),
                    I18nManager.t('errorGuide.unknownErrorStep2')
                ]);
        }

        dialogElement.classList.add('active');
    }

    function addSteps(container, stepTexts) {
        stepTexts.forEach(function(text) {
            const li = document.createElement('li');
            li.textContent = text;
            container.appendChild(li);
        });
    }

    function close() {
        if (dialogElement) {
            dialogElement.classList.remove('active');
        }
    }

    function openWorkflowEditor() {
        // Try to open workflow editor if available
        const workflowBtn = document.querySelector('[onclick*="openWorkflowEditor"]') ||
                           document.querySelector('.workflow-editor-trigger') ||
                           $('btnOpenWorkflowEditor');
        if (workflowBtn) {
            workflowBtn.click();
        } else if (typeof window.openComfyUIWorkflowEditor === 'function') {
            window.openComfyUIWorkflowEditor();
        } else {
            // Fallback: show sidebar and scroll to workflow section
            const sidebarToggle = $('sidebarToggle');
            if (sidebarToggle && !document.querySelector('.sidebar-panel.active')) {
                sidebarToggle.click();
            }
        }
    }

    // Check if ComfyUI is online
    function isComfyUIOnline() {
        const indicator = $('connectionIndicator');
        return indicator && indicator.classList.contains('online');
    }

    // Show appropriate error guide based on error context
    function showForError(error, context = {}) {
        // Check ComfyUI connection status
        if (!isComfyUIOnline()) {
            show(ERROR_TYPES.COMFYUI_OFFLINE);
            return;
        }

        // Check for workflow not found
        if (context.workflowNotFound) {
            show(ERROR_TYPES.WORKFLOW_NOT_FOUND, { workflowType: context.workflowType || 'T2I' });
            return;
        }

        // Check for missing nodes
        if (context.missingNodes && context.missingNodes.length > 0) {
            show(ERROR_TYPES.WORKFLOW_NODE_MISSING, { missingNodes: context.missingNodes });
            return;
        }

        // Check error message for network issues
        const errorMsg = error?.message || error || '';
        if (errorMsg.includes('NetworkError') ||
            errorMsg.includes('Failed to fetch') ||
            errorMsg.includes('network') ||
            errorMsg.includes('CORS')) {
            show(ERROR_TYPES.NETWORK_ERROR);
            return;
        }

        // Generic generation error
        show(ERROR_TYPES.GENERATION_ERROR, {
            errorMessage: errorMsg,
            errorDetail: context.errorDetail
        });
    }

    return {
        init: init,
        show: show,
        close: close,
        showForError: showForError,
        ERROR_TYPES: ERROR_TYPES
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    ErrorGuideDialog.init();
});
