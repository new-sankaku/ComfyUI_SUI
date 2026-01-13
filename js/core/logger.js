// Simple Logger - No external dependencies
const LogLevel = {
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    SILENT: 5
};

function SimpleLogger(moduleName, defaultLevel = LogLevel.INFO) {
    let currentLevel = defaultLevel;

    function getCallerInfo() {
        try {
            const stack = new Error().stack;
            if (!stack) return '';

            const lines = stack.split('\n');
            // Skip Error, getCallerInfo, formatMessage, and the logger method
            for (let i = 3; i < lines.length; i++) {
                const line = lines[i];
                if (!line.includes('logger.js')) {
                    // Extract filename and line number
                    const match = line.match(/(?:at\s+)?(?:.*?\s+\()?([^()\s]+):(\d+):\d+\)?$/);
                    if (match) {
                        const file = match[1].split('/').pop().split('\\').pop().split('?')[0];
                        return `${file}:${match[2]}`;
                    }
                }
            }
            return '';
        } catch (e) {
            return '';
        }
    }

    function formatMessage(level, message) {
        const time = new Date().toTimeString().split(' ')[0];
        const caller = getCallerInfo();
        const callerStr = caller ? ` [${caller}]` : '';
        return `${time} ${level} [${moduleName}]${callerStr} ${message}`;
    }

    function argsToString(args) {
        return args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
    }

    return {
        trace: function(...args) {
            if (currentLevel <= LogLevel.TRACE) {
                console.log(formatMessage('TRACE', argsToString(args)));
            }
        },

        debug: function(...args) {
            if (currentLevel <= LogLevel.DEBUG) {
                console.log(formatMessage('DEBUG', argsToString(args)));
            }
        },

        info: function(...args) {
            if (currentLevel <= LogLevel.INFO) {
                console.info(formatMessage('INFO', argsToString(args)));
            }
        },

        warn: function(...args) {
            if (currentLevel <= LogLevel.WARN) {
                console.warn(formatMessage('WARN', argsToString(args)));
            }
        },

        error: function(...args) {
            if (currentLevel <= LogLevel.ERROR) {
                console.error(formatMessage('ERROR', argsToString(args)));
            }
        },

        setLevel: function(level) {
            if (typeof level === 'string') {
                switch (level.toLowerCase()) {
                    case 'trace': currentLevel = LogLevel.TRACE; break;
                    case 'debug': currentLevel = LogLevel.DEBUG; break;
                    case 'info': currentLevel = LogLevel.INFO; break;
                    case 'warn': currentLevel = LogLevel.WARN; break;
                    case 'error': currentLevel = LogLevel.ERROR; break;
                    case 'silent': currentLevel = LogLevel.SILENT; break;
                    default: currentLevel = LogLevel.INFO;
                }
            } else {
                currentLevel = level;
            }
            return currentLevel;
        },

        getLevel: function() {
            switch (currentLevel) {
                case LogLevel.TRACE: return 'trace';
                case LogLevel.DEBUG: return 'debug';
                case LogLevel.INFO: return 'info';
                case LogLevel.WARN: return 'warn';
                case LogLevel.ERROR: return 'error';
                case LogLevel.SILENT: return 'silent';
                default: return 'unknown';
            }
        }
    };
}

// Logger instances for different modules
const logger = new SimpleLogger('main', LogLevel.INFO);
const generatorLogger = new SimpleLogger('generator', LogLevel.INFO);
const workflowLogger = new SimpleLogger('workflow', LogLevel.INFO);
const comfyuiLogger = new SimpleLogger('comfyui', LogLevel.INFO);
const uiLogger = new SimpleLogger('ui', LogLevel.INFO);
const i18nLogger = new SimpleLogger('i18n', LogLevel.INFO);
