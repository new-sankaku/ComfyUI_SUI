import { readFileSync } from 'fs';
import { resolve } from 'path';
import vm from 'vm';

/**
 * Load a vanilla JS file into a sandboxed context and return its exports.
 * Since the project uses no module system (all scripts loaded via <script> tags),
 * we use Node's vm module to evaluate the file in a controlled sandbox.
 *
 * Note: const/let declarations in vm contexts don't attach to the sandbox object.
 * We wrap the code to explicitly assign all top-level const/let declarations to
 * the sandbox's global scope so they can be accessed in tests.
 *
 * @param {string} relativePath - Path relative to project root (e.g. 'js/core/logger.js')
 * @param {object} [extraGlobals={}] - Additional globals to inject into the sandbox
 * @returns {object} The sandbox object containing all top-level declarations
 */
export function loadScript(relativePath, extraGlobals = {}) {
    const projectRoot = resolve(import.meta.dirname, '..', '..');
    const filePath = resolve(projectRoot, relativePath);
    const code = readFileSync(filePath, 'utf-8');

    const sandbox = {
        // Minimal browser-like globals
        console,
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        Math,
        JSON,
        Error,
        Date,
        Array,
        Object,
        String,
        Number,
        Boolean,
        RegExp,
        Map,
        Set,
        Promise,
        Symbol,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        undefined,
        NaN,
        Infinity,
        crypto: globalThis.crypto,
        // Inject any extra globals the caller needs
        ...extraGlobals,
    };

    vm.createContext(sandbox);

    // Run the original code first to define everything
    vm.runInContext(code, sandbox, { filename: filePath });

    // Extract const/let declarations that don't attach to sandbox.
    // We wrap the code in an IIFE that returns an object with all top-level declarations,
    // then merge them into the sandbox.
    const constLetNames = extractTopLevelConstLetNames(code);
    if (constLetNames.length > 0) {
        const exportCode = `
            (function() {
                ${code}
                return { ${constLetNames.join(', ')} };
            })();
        `;
        const exported = vm.runInContext(exportCode, sandbox, { filename: filePath + '?extract' });
        for (const [key, value] of globalThis.Object.entries(exported)) {
            sandbox[key] = value;
        }
    }

    return sandbox;
}

/**
 * Extract names of top-level const and let declarations from source code.
 * Uses simple regex-based parsing (not a full AST) - sufficient for this project's patterns.
 */
function extractTopLevelConstLetNames(code) {
    const names = [];
    // Match top-level const/let declarations (not indented, at start of line)
    const regex = /^(?:const|let)\s+(\w+)/gm;
    let match;
    while ((match = regex.exec(code)) !== null) {
        // Simple heuristic: if the line starts at column 0, it's top-level
        const lineStart = code.lastIndexOf('\n', match.index) + 1;
        const indent = match.index - lineStart;
        if (indent === 0) {
            names.push(match[1]);
        }
    }
    return names;
}
