import globals from 'globals';

// Project-specific globals: top-level vars/functions/classes defined across JS files loaded via <script> tags
const projectGlobals = {
    // js/core/core.js
    $: 'readonly',
    socket: 'writable',
    comfyUIuuid: 'readonly',
    firstComfyConnection: 'writable',
    comfyObjectInfoList: 'writable',
    ComfyUIEndpoints: 'readonly',
    comfyUIEndpointsInstance: 'readonly',
    comfyUIUrls: 'readonly',
    Comfyui_connect: 'readonly',

    // js/core/logger.js
    LogLevel: 'readonly',
    SimpleLogger: 'readonly',
    logger: 'readonly',
    generatorLogger: 'readonly',
    workflowLogger: 'readonly',
    comfyuiLogger: 'readonly',
    uiLogger: 'readonly',
    i18nLogger: 'readonly',

    // js/core/app-init.js
    getText: 'readonly',
    updateLoopLineCount: 'readonly',
    updateI2ILoopLineCount: 'readonly',
    updateI2IAngleLineCount: 'readonly',

    // js/i18n/sui-i18n.js
    I18nManager: 'readonly',

    // js/ui/toast.js
    createToast: 'readonly',
    createToastError: 'readonly',
    showToast: 'readonly',
    startProgressBar: 'readonly',
    checkActiveImage: 'readonly',
    checkPanelImage: 'readonly',
    checkRoughTarget: 'readonly',

    // js/ui/ui-controller.js
    switchMode: 'readonly',
    updateTabDisabledStates: 'readonly',
    openWorkflowEditor: 'readonly',
    closeWorkflowEditor: 'readonly',
    randomSeed: 'readonly',
    clearForm: 'readonly',
    switchTab: 'readonly',
    updateWorkflowDisplays: 'readonly',
    setWorkflowDisplayName: 'readonly',
    hookWorkflowRepository: 'readonly',

    // js/ui/workflow-selector.js
    workflowSelector: 'readonly',

    // js/ui/theme-manager.js
    ThemeManager: 'readonly',

    // js/ui/error-guide-dialog.js
    ErrorGuideDialog: 'readonly',

    // js/connection/connection.js
    isComfyUIOnlineGlobal: 'writable',
    updateConnectionStatus: 'readonly',
    syncWorkflowEditorConnectionStatus: 'readonly',
    checkComfyUIConnection: 'readonly',

    // js/generator/generator.js
    currentMode: 'writable',
    isGenerating: 'writable',
    isCancelled: 'writable',
    workflowEditorInitialized: 'writable',
    i2iUploadedFileNames: 'writable',
    i2iloopUploadedFileNames: 'writable',
    i2iangleUploadedFileNames: 'writable',
    upscaleloopUploadedFileNames: 'writable',
    rembgloopUploadedFileNames: 'writable',
    showCancelButton: 'readonly',
    hideCancelButton: 'readonly',
    setGenerateButtonGenerating: 'readonly',
    cancelGeneration: 'readonly',
    normalizeImageSize: 'readonly',
    generationTimes: 'writable',
    updateGenerationTimeStats: 'readonly',
    resetGenerationTimeStats: 'readonly',
    generateImageNormal: 'readonly',
    generateImageLoop: 'readonly',
    generateImageWildcard: 'readonly',
    generateImageI2I: 'readonly',
    generateImageI2ILoop: 'readonly',
    loadObjectInfo: 'readonly',
    generateImage: 'readonly',
    generateImageLoopExec: 'readonly',
    generateImageWildcardExec: 'readonly',
    executeWorkflow: 'readonly',
    getImageUrl: 'readonly',
    waitForCompletion: 'readonly',
    uploadImageToComfyUI: 'readonly',
    setupI2IImageUpload: 'readonly',
    handleI2IImageFiles: 'readonly',
    updateI2IPreview: 'readonly',
    rebuildI2IPreview: 'readonly',
    updateI2IImageCount: 'readonly',
    generateImageI2IExec: 'readonly',
    generateImageI2ILoopExec: 'readonly',
    generateImageI2IAngle: 'readonly',
    generateImageI2IAngleExec: 'readonly',
    generateImageT2A: 'readonly',
    generateImageT2AExec: 'readonly',
    executeWorkflowAudio: 'readonly',
    displayGeneratedAudio: 'readonly',
    downloadAudio: 'readonly',
    generateImageUpscaleLoop: 'readonly',
    generateImageUpscaleLoopExec: 'readonly',
    generateImageRembgLoop: 'readonly',
    generateImageRembgLoopExec: 'readonly',

    // js/image/image-display.js
    currentModalImageIndex: 'writable',
    getImageList: 'readonly',
    displayGeneratedImage: 'readonly',
    modalZoomScale: 'writable',
    openImageModal: 'readonly',
    closeImageModal: 'readonly',
    toggleImageZoom: 'readonly',
    handleModalWheel: 'readonly',
    navigateImage: 'readonly',
    updateNavigationButtons: 'readonly',
    handleModalKeydown: 'readonly',
    initImageModalNavigation: 'readonly',
    downloadImage: 'readonly',
    clearGeneratedImages: 'readonly',
    downloadAllImages: 'readonly',

    // js/image/camera-widget.js
    CameraWidget: 'readonly',
    cameraWidgetInstance: 'writable',
    initCameraWidget: 'readonly',
    addAnglePromptFromWidget: 'readonly',

    // js/prompt/prompt-util.js
    removePromptComments: 'readonly',
    expandWildcards: 'readonly',
    setupPromptWeightAdjustment: 'readonly',
    adjustPromptWeight: 'readonly',
    getRawPromptText: 'readonly',
    getRawNegativePromptText: 'readonly',
    processPromptWithWildcard: 'readonly',
    getProcessedPromptForGeneration: 'readonly',
    getProcessedNegativePromptForGeneration: 'readonly',
    getProcessedPromptsForGeneration: 'readonly',
    getProcessedPrompt: 'readonly',
    getProcessedNegativePrompt: 'readonly',

    // js/prompt/metadata-marker.js
    applyMetadataMarker: 'readonly',
    extractPngTextChunks: 'readonly',
    insertPngTextChunks: 'readonly',
    extractWebPMetadataChunks: 'readonly',
    insertWebPMetadataChunks: 'readonly',

    // js/prompt/prompt-history.js
    promptHistoryManager: 'readonly',

    // js/wildcard/wildcard-manager.js
    wildcardStore: 'writable',
    wildcardList: 'writable',
    wildcardEditing: 'writable',
    promptTagify: 'writable',
    wildcardUid: 'readonly',
    wildcardInit: 'readonly',
    wildcardRefresh: 'readonly',
    wildcardUpdateTagifyWhitelist: 'readonly',
    wildcardRender: 'readonly',
    wildcardFilterList: 'readonly',
    wildcardOpenEditor: 'readonly',
    wildcardCloseEditor: 'readonly',
    wildcardSave: 'readonly',
    wildcardDelete: 'readonly',
    wildcardInitTagify: 'readonly',
    wildcardGetItem: 'readonly',
    wildcardSearch: 'readonly',
    wildcardReloadList: 'readonly',
    wildcardRemoveComments: 'readonly',
    wildcardProcessPrompt: 'readonly',
    wildcardGetPromptText: 'readonly',
    wildcardReplaceAndGetPrompt: 'readonly',
    wildcardImportData: 'readonly',
    wildcardCloseImport: 'readonly',
    wildcardDoImport: 'readonly',
    wildcardExportData: 'readonly',
    wildcardClearAll: 'readonly',
    wildcardToast: 'readonly',

    // js/wildcard/wildcard-default.js
    wildcardDefaults: 'readonly',

    // js/settings/settings-storage.js
    settingsStore: 'readonly',
    urlHistoryStore: 'readonly',
    URL_HISTORY_MAX: 'readonly',
    getUrlHistory: 'readonly',
    addUrlToHistory: 'readonly',
    removeUrlFromHistory: 'readonly',
    DEFAULT_COMFYUI_URL: 'readonly',
    resetUrlToDefault: 'readonly',
    renderUrlHistoryPopup: 'readonly',
    showUrlHistoryPopup: 'readonly',
    hideUrlHistoryPopup: 'readonly',
    toggleUrlHistoryPopup: 'readonly',
    setupUrlHistoryPopup: 'readonly',
    saveFormSettings: 'readonly',
    loadFormSettings: 'readonly',
    setupAutoSave: 'readonly',

    // js/dashboard/dashboard-ui.js
    DashboardUI: 'readonly',

    // js/dashboard/performance-storage.js
    PerformanceStorage: 'readonly',

    // js/dashboard/prompt-frequency-storage.js
    PromptFrequencyStorage: 'readonly',

    // js/ai/ComfyUI/v2/comfyui-object-info-repository.js
    objectInfoRepository: 'readonly',

    // js/ai/ComfyUI/v2/comfyui-util.js
    comfyuiTypes: 'readonly',
    comfyuiImageUploadTypes: 'readonly',
    comfyuiRequiresImageUpload: 'readonly',
    comfyuiReplacePlaceholders: 'readonly',
    comfyuiGetValueById: 'readonly',
    generateFilenameIndex: 'writable',
    generateFilename: 'readonly',
    getClassTypeOnlyByJson: 'readonly',
    checkWorkflowNodeVsComfyUI: 'readonly',
    notExistsWorkflowNodeVsComfyUI: 'readonly',

    // js/ai/ComfyUI/v2/comfyui-util-v2.js
    comfyui_apiHeartbeat_v2: 'readonly',
    isOnline: 'writable',
    comfyui_monitorConnection_v2: 'readonly',
    generateTimestampFileNameV2: 'readonly',
    comfyui_uploadImage_v2: 'readonly',
    comfyui_handleFileUpload_v2: 'readonly',
    comfyui_view_image_v2: 'readonly',
    comfyui_fixWorkflowTypes_v2: 'readonly',
    comfyui_execute_and_wait_v2: 'readonly',
    comfyui_put_queue_v2: 'readonly',
    comfyui_get_image_v2: 'readonly',
    comfyui_getErrorMessage_v2: 'readonly',
    comfyui_queue_prompt_v2: 'readonly',
    comfyui_get_history_v2: 'readonly',
    comfyui_track_prompt_progress_v2: 'readonly',
    comfyui_isError_v2: 'readonly',

    // js/ai/ComfyUI/v2/comfyui-management.js (some overlap with core.js - these are additional)
    reader: 'writable',
    selectedWorkflow: 'writable',
    processingPrompt: 'writable',
    workflowFileLoad: 'writable',
    comfyuiConnect: 'readonly',
    comfyuiApiHeartbeat: 'readonly',
    comfyuiHandleProcessQueue: 'readonly',
    comfyuiUploadImage: 'readonly',
    comfyuiFetchSampler: 'readonly',
    comfyuiFetchUpscaler: 'readonly',
    comfyuiFetchModels: 'readonly',
    comfyuiClipModels: 'readonly',
    comfyuiVaeLoader: 'readonly',
    comfyuiFetchObjectInfo: 'readonly',
    comfyuiFetchObjectInfoOnly: 'readonly',

    // js/ai/ComfyUI/v2/comfyui-upscaler-model.js
    UPSCALER_MODEL_SELECT_ID: 'readonly',
    preferredUpscalerModelName: 'writable',
    extractComboOptions: 'readonly',
    setPreferredUpscalerModel: 'readonly',
    getSelectedUpscalerModel: 'readonly',
    updateUpscalerDropdown: 'readonly',
    refreshUpscalerModelOptions: 'readonly',
    loadUpscalerModelOptionsFromCache: 'readonly',

    // js/ai/ComfyUI/v2/comfyui-workflow-builder.js
    ComfyUIWorkflowBuilder: 'readonly',
    isNumericType: 'readonly',
    createWorkflowBuilder: 'readonly',

    // js/ai/ComfyUI/v2/comfyui-workflow-editor.js
    ComfyUIWorkflowEditor: 'readonly',
    comfyUIWorkflowEditor: 'writable',

    // js/ai/ComfyUI/v2/comfyui-workflow-editor-tab.js
    ComfyUIWorkflowTab: 'readonly',

    // js/ai/ComfyUI/v2/comfyui-workflow-interact.js
    ComfyUIWorkflowWindow: 'readonly',
    comfyUIWorkflowWindow: 'writable',

    // js/ai/ComfyUI/v2/comfyui-workflow-repository.js
    comfyUIWorkflowRepository: 'readonly',

    // js/ai/ComfyUI/v2/comfyui_workflow/ (default workflow constants)
    comfyuiDefaultWorkflows: 'readonly',
    ComfyUI_Rembg_ByInspyrenet: 'readonly',
    createRembgWorkflow: 'readonly',
    ComfyUI_Rembg_ByRMBG20: 'readonly',
    ComfyUI_Rembg_ByBEN2: 'readonly',
    ComfyUI_Rembg_ByBiRefNetToonout: 'readonly',
    ComfyUI_Rembg_ByBiRefNetHR: 'readonly',
    ComfyUI_Rembg_ByBiRefNetPortrait: 'readonly',
    ComfyUI_Rembg_ByBiRefNetMatting: 'readonly',
    ComfyUI_Upscaler: 'readonly',
    ComfyUI_T2A_AudioAce: 'readonly',
    ComfyUI_T2I_Z_Image_turbo: 'readonly',
    ComfyUI_T2I_Qwen_Image_gguf: 'readonly',
    ComfyUI_T2I_BySDXL_faceDetailer_Lora: 'readonly',
    ComfyUI_T2I_BySDXL_faceDetailer: 'readonly',
    ComfyUI_T2I_BySDXL: 'readonly',
    ComfyUI_T2I_BySDXL_Lora: 'readonly',
    ComfyUI_T2I_BySDXL_Refiner: 'readonly',
    ComfyUI_T2I_BySD15: 'readonly',
    ComfyUI_T2I_BySD15_VAE: 'readonly',
    ComfyUI_T2I_BySD15_Lora: 'readonly',
    ComfyUI_I2I_ImageEdit_MultiAngle: 'readonly',
    ComfyUI_I2I_BySD15SDXL: 'readonly',
    ComfyUI_T2I_ByFluxDiffusion: 'readonly',
    ComfyUI_T2I_ByFluxNF4: 'readonly',
    ComfyUI_T2I_ByFluxSimple: 'readonly',
};

// CDN / external library globals
const cdnGlobals = {
    Chart: 'readonly',
    WordCloud: 'readonly',
    Tagify: 'readonly',
    localforage: 'readonly',
    THREE: 'readonly',
    JSZip: 'readonly',
    ExifReader: 'readonly',
    fabric: 'readonly',
    interact: 'readonly',
    bootstrap: 'readonly',
    Masonry: 'readonly',
};

// Legacy/unused globals referenced in comfyui-management.js (older standalone file)
const legacyGlobals = {
    getDiffusionInfomation: 'readonly',
    baseRequestData: 'readonly',
    basePrompt: 'readonly',
    removeSpinner: 'readonly',
    comfyuiQueue: 'readonly',
    isPanel: 'readonly',
    calculateCenter: 'readonly',
    putImageInFrame: 'readonly',
    replaceImageObject: 'readonly',
    imageObject2Base64ImageEffectKeep: 'readonly',
    updateSamplerDropdown: 'readonly',
    updateModelDropdown: 'readonly',
    updateTagifyDropdown: 'readonly',
    updateVaeDropdown: 'readonly',
    canvas: 'readonly',
    isImage: 'readonly',
    workflow: 'writable',
};

export default [
    {
        // Main config for browser JS files
        files: ['js/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                ...globals.browser,
                ...cdnGlobals,
                ...projectGlobals,
                ...legacyGlobals,
            },
        },
        rules: {
            // Bug detection
            'no-undef': 'error',
            'no-unused-vars': [
                'warn',
                {
                    args: 'none',
                    varsIgnorePattern: '^_',
                    vars: 'local', // Only check local vars; top-level globals are used across scripts
                },
            ],
            'no-redeclare': ['error', { builtinGlobals: false }],
            eqeqeq: ['error', 'smart'],
            'no-implicit-globals': 'off', // All our vars are intentionally global

            // Best practices
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-wrappers': 'error',
            'no-throw-literal': 'error',
            'no-self-compare': 'error',
            'no-template-curly-in-string': 'warn',
            'no-constant-condition': ['error', { checkLoops: false }],
            'no-debugger': 'warn',
            'no-duplicate-case': 'error',
            'no-empty': ['error', { allowEmptyCatch: true }],
            'no-extra-boolean-cast': 'error',
            'no-unreachable': 'error',
            'no-unsafe-negation': 'error',
            'use-isnan': 'error',
            'valid-typeof': 'error',

            // Style (non-conflicting with Prettier)
            'prefer-const': 'warn',
            'no-var': 'off', // Existing code uses var extensively
        },
    },
    {
        // Test files use ES modules
        files: ['tests/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },
        rules: {
            'no-undef': 'error',
            'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
        },
    },
    {
        // Ignore patterns
        ignores: ['node_modules/', 'coverage/', 'js/wildcard/wildcard-default.js'],
    },
];
