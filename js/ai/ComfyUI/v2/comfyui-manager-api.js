// ComfyUI-Manager API Utility
// Provides functions to interact with ComfyUI-Manager for node installation, updates, etc.

const ComfyUIManagerAPI = (function() {

    // Get base URL from ComfyUI settings
    function getBaseUrl() {
        const urlInput = $('comfyUIPageUrl');
        return urlInput ? urlInput.value : 'http://127.0.0.1:8188';
    }

    // Generate unique UI ID for requests
    function generateUiId() {
        return 'sui-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Check if ComfyUI-Manager is available
    async function isManagerAvailable() {
        try {
            const response = await fetch(`${getBaseUrl()}/manager/queue/status`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            return response.ok;
        } catch (error) {
            console.warn('ComfyUI-Manager not available:', error);
            return false;
        }
    }

    // Get node mappings (node class_type -> package name)
    async function getNodeMappings() {
        try {
            const response = await fetch(`${getBaseUrl()}/customnode/getmappings`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to get node mappings:', error);
            return null;
        }
    }

    // Get installed custom nodes
    async function getInstalledNodes() {
        try {
            const response = await fetch(`${getBaseUrl()}/customnode/installed`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to get installed nodes:', error);
            return null;
        }
    }

    // Get custom node list (all available nodes)
    async function getCustomNodeList() {
        try {
            const response = await fetch(`${getBaseUrl()}/customnode/getlist`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to get custom node list:', error);
            return null;
        }
    }

    // Find package info for missing nodes
    async function findPackagesForNodes(missingNodeClassTypes) {
        const mappings = await getNodeMappings();
        if (!mappings) return [];

        const packagesToInstall = new Map();

        for (const nodeClassType of missingNodeClassTypes) {
            // Search in mappings
            for (const [packageUrl, nodeList] of Object.entries(mappings)) {
                if (Array.isArray(nodeList) && nodeList.includes(nodeClassType)) {
                    if (!packagesToInstall.has(packageUrl)) {
                        packagesToInstall.set(packageUrl, {
                            url: packageUrl,
                            nodes: []
                        });
                    }
                    packagesToInstall.get(packageUrl).nodes.push(nodeClassType);
                    break;
                }
            }
        }

        return Array.from(packagesToInstall.values());
    }

    // Install a custom node package
    async function installNode(nodeId, version = 'latest', options = {}) {
        try {
            const response = await fetch(`${getBaseUrl()}/manager/queue/install`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ui_id: generateUiId(),
                    id: nodeId,
                    version: version,
                    channel: options.channel || 'default',
                    mode: options.mode || 'default',
                    skip_post_install: options.skipPostInstall || false
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to install node:', error);
            throw error;
        }
    }

    // Install from Git URL
    async function installFromGitUrl(gitUrl) {
        try {
            const response = await fetch(`${getBaseUrl()}/customnode/install/git_url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ui_id: generateUiId(),
                    url: gitUrl
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to install from git URL:', error);
            throw error;
        }
    }

    // Update a custom node
    async function updateNode(nodeId, version = 'latest') {
        try {
            const response = await fetch(`${getBaseUrl()}/manager/queue/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ui_id: generateUiId(),
                    id: nodeId,
                    version: version
                })
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to update node:', error);
            throw error;
        }
    }

    // Update all nodes
    async function updateAllNodes() {
        try {
            const response = await fetch(`${getBaseUrl()}/manager/queue/update_all`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to update all nodes:', error);
            throw error;
        }
    }

    // Check for updates
    async function checkForUpdates() {
        try {
            const response = await fetch(`${getBaseUrl()}/customnode/fetch_updates`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            // 201 = updates available, 200 = no updates
            return {
                hasUpdates: response.status === 201,
                status: response.status
            };
        } catch (error) {
            console.error('Failed to check for updates:', error);
            return { hasUpdates: false, error: error.message };
        }
    }

    // Get queue status
    async function getQueueStatus() {
        try {
            const response = await fetch(`${getBaseUrl()}/manager/queue/status`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to get queue status:', error);
            return null;
        }
    }

    // Start queue processing
    async function startQueue() {
        try {
            const response = await fetch(`${getBaseUrl()}/manager/queue/start`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to start queue:', error);
            throw error;
        }
    }

    // Reboot ComfyUI
    async function rebootComfyUI() {
        try {
            const response = await fetch(`${getBaseUrl()}/manager/reboot`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            return response.ok;
        } catch (error) {
            // Connection will be lost during reboot, this is expected
            console.log('Reboot initiated, connection lost as expected');
            return true;
        }
    }

    // Get model list (for downloading)
    async function getModelList() {
        try {
            const response = await fetch(`${getBaseUrl()}/externalmodel/getlist`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to get model list:', error);
            return null;
        }
    }

    // Install/download a model
    async function installModel(modelInfo) {
        try {
            const response = await fetch(`${getBaseUrl()}/manager/queue/install_model`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ui_id: generateUiId(),
                    filename: modelInfo.filename,
                    url: modelInfo.url,
                    type: modelInfo.type, // checkpoint, lora, vae, etc.
                    save_path: modelInfo.save_path || 'default',
                    name: modelInfo.name || modelInfo.filename,
                    base: modelInfo.base || ''
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to install model:', error);
            throw error;
        }
    }

    // ========================================
    // Workflow Analysis Functions
    // ========================================

    // Analyze workflow and find prompt input locations
    async function analyzeWorkflowPromptLocations(workflow) {
        const objectInfo = await objectInfoRepository.getObjectInfo();
        if (!objectInfo) {
            console.warn('ObjectInfo not available for prompt analysis');
            return [];
        }

        const promptLocations = [];

        for (const [nodeId, node] of Object.entries(workflow)) {
            const classType = node.class_type;
            const nodeInfo = objectInfo[classType];

            if (!nodeInfo || !nodeInfo.input) continue;

            const allInputs = {
                ...(nodeInfo.input.required || {}),
                ...(nodeInfo.input.optional || {})
            };

            for (const [inputName, inputDef] of Object.entries(allInputs)) {
                // Check if this is a STRING type with multiline (typical prompt input)
                if (Array.isArray(inputDef) && inputDef[0] === 'STRING') {
                    const options = inputDef[1] || {};
                    if (options.multiline === true) {
                        const currentValue = node.inputs?.[inputName] || '';
                        promptLocations.push({
                            nodeId: nodeId,
                            nodeType: classType,
                            inputName: inputName,
                            currentValue: currentValue,
                            isLikelyPrompt: isLikelyPromptField(classType, inputName),
                            isLikelyNegative: isLikelyNegativePromptField(classType, inputName)
                        });
                    }
                }
            }
        }

        // Sort by likelihood of being a prompt field
        promptLocations.sort((a, b) => {
            if (a.isLikelyPrompt && !b.isLikelyPrompt) return -1;
            if (!a.isLikelyPrompt && b.isLikelyPrompt) return 1;
            if (a.isLikelyNegative && !b.isLikelyNegative) return 1;
            if (!a.isLikelyNegative && b.isLikelyNegative) return -1;
            return 0;
        });

        return promptLocations;
    }

    // Heuristic to determine if a field is likely a prompt field
    function isLikelyPromptField(classType, inputName) {
        const promptPatterns = [
            /^text$/i,
            /^prompt$/i,
            /^positive$/i,
            /clip.*text/i,
            /encode.*text/i
        ];
        const promptNodeTypes = [
            'CLIPTextEncode',
            'CLIPTextEncodeSDXL',
            'ConditioningCombine',
            'Text',
            'String'
        ];

        const inputMatches = promptPatterns.some(p => p.test(inputName));
        const nodeMatches = promptNodeTypes.some(t => classType.includes(t));

        return inputMatches || nodeMatches;
    }

    // Heuristic to determine if a field is likely a negative prompt field
    function isLikelyNegativePromptField(classType, inputName) {
        const negativePatterns = [
            /negative/i,
            /^neg$/i,
            /uncond/i
        ];

        return negativePatterns.some(p => p.test(inputName) || p.test(classType));
    }

    // Auto-configure workflow with placeholders
    function autoConfigureWorkflowPlaceholders(workflow, promptLocations) {
        const configuredWorkflow = JSON.parse(JSON.stringify(workflow));

        let positiveSet = false;
        let negativeSet = false;

        for (const location of promptLocations) {
            const node = configuredWorkflow[location.nodeId];
            if (!node || !node.inputs) continue;

            if (location.isLikelyNegative && !negativeSet) {
                node.inputs[location.inputName] = '%negative%';
                negativeSet = true;
            } else if (location.isLikelyPrompt && !positiveSet) {
                node.inputs[location.inputName] = '%prompt%';
                positiveSet = true;
            }
        }

        return {
            workflow: configuredWorkflow,
            configured: {
                positive: positiveSet,
                negative: negativeSet
            }
        };
    }

    // ========================================
    // High-level Helper Functions
    // ========================================

    // Install missing nodes and optionally reboot
    async function installMissingNodesAndReboot(missingNodeClassTypes, autoReboot = false) {
        const packages = await findPackagesForNodes(missingNodeClassTypes);

        if (packages.length === 0) {
            return {
                success: false,
                message: 'Could not find packages for the missing nodes',
                notFound: missingNodeClassTypes
            };
        }

        const results = {
            installed: [],
            failed: [],
            notFound: []
        };

        // Find which nodes weren't matched
        const foundNodes = new Set();
        packages.forEach(pkg => pkg.nodes.forEach(n => foundNodes.add(n)));
        missingNodeClassTypes.forEach(n => {
            if (!foundNodes.has(n)) results.notFound.push(n);
        });

        // Install each package
        for (const pkg of packages) {
            try {
                await installFromGitUrl(pkg.url);
                results.installed.push({
                    url: pkg.url,
                    nodes: pkg.nodes
                });
            } catch (error) {
                results.failed.push({
                    url: pkg.url,
                    nodes: pkg.nodes,
                    error: error.message
                });
            }
        }

        // Start queue to begin installation
        if (results.installed.length > 0) {
            try {
                await startQueue();
            } catch (e) {
                console.warn('Failed to start queue:', e);
            }
        }

        // Reboot if requested and installations were successful
        if (autoReboot && results.installed.length > 0 && results.failed.length === 0) {
            await rebootComfyUI();
            results.rebooting = true;
        }

        results.success = results.installed.length > 0;
        return results;
    }

    // Public API
    return {
        // Manager availability
        isManagerAvailable,

        // Node management
        getNodeMappings,
        getInstalledNodes,
        getCustomNodeList,
        findPackagesForNodes,
        installNode,
        installFromGitUrl,
        updateNode,
        updateAllNodes,
        checkForUpdates,

        // Queue management
        getQueueStatus,
        startQueue,
        rebootComfyUI,

        // Model management
        getModelList,
        installModel,

        // Workflow analysis
        analyzeWorkflowPromptLocations,
        autoConfigureWorkflowPlaceholders,

        // High-level helpers
        installMissingNodesAndReboot
    };
})();
