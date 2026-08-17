import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadScript } from '../helpers/load-script.js';

describe('logger.js', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = loadScript('js/core/logger.js', {
            console: {
                log: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
                error: vi.fn(),
            },
        });
    });

    describe('LogLevel', () => {
        it('should define correct log level values', () => {
            expect(sandbox.LogLevel.TRACE).toBe(0);
            expect(sandbox.LogLevel.DEBUG).toBe(1);
            expect(sandbox.LogLevel.INFO).toBe(2);
            expect(sandbox.LogLevel.WARN).toBe(3);
            expect(sandbox.LogLevel.ERROR).toBe(4);
            expect(sandbox.LogLevel.SILENT).toBe(5);
        });
    });

    describe('SimpleLogger', () => {
        it('should create a logger with default INFO level', () => {
            const log = sandbox.SimpleLogger('test');
            expect(log.getLevel()).toBe('info');
        });

        it('should create a logger with custom level', () => {
            const log = sandbox.SimpleLogger('test', sandbox.LogLevel.DEBUG);
            expect(log.getLevel()).toBe('debug');
        });

        it('should set level by string', () => {
            const log = sandbox.SimpleLogger('test');
            log.setLevel('debug');
            expect(log.getLevel()).toBe('debug');

            log.setLevel('error');
            expect(log.getLevel()).toBe('error');

            log.setLevel('silent');
            expect(log.getLevel()).toBe('silent');
        });

        it('should set level by string case-insensitively', () => {
            const log = sandbox.SimpleLogger('test');
            log.setLevel('TRACE');
            expect(log.getLevel()).toBe('trace');

            log.setLevel('Warn');
            expect(log.getLevel()).toBe('warn');
        });

        it('should set level by number', () => {
            const log = sandbox.SimpleLogger('test');
            log.setLevel(sandbox.LogLevel.ERROR);
            expect(log.getLevel()).toBe('error');
        });

        it('should default to INFO for unknown string level', () => {
            const log = sandbox.SimpleLogger('test');
            log.setLevel('trace'); // set to known non-INFO level first
            expect(log.getLevel()).toBe('trace');
            log.setLevel('nonsense');
            expect(log.getLevel()).toBe('info');
        });

        it('should return level value from setLevel', () => {
            const log = sandbox.SimpleLogger('test');
            const level = log.setLevel('debug');
            expect(level).toBe(sandbox.LogLevel.DEBUG);
        });
    });

    describe('Log level filtering', () => {
        it('should log messages at or above current level', () => {
            const log = sandbox.SimpleLogger('test', sandbox.LogLevel.WARN);

            log.trace('trace msg');
            log.debug('debug msg');
            log.info('info msg');
            log.warn('warn msg');
            log.error('error msg');

            expect(sandbox.console.log).not.toHaveBeenCalled(); // trace and debug use console.log
            expect(sandbox.console.info).not.toHaveBeenCalled();
            expect(sandbox.console.warn).toHaveBeenCalledTimes(1);
            expect(sandbox.console.error).toHaveBeenCalledTimes(1);
        });

        it('should log all messages at TRACE level', () => {
            const log = sandbox.SimpleLogger('test', sandbox.LogLevel.TRACE);

            log.trace('t');
            log.debug('d');
            log.info('i');
            log.warn('w');
            log.error('e');

            expect(sandbox.console.log).toHaveBeenCalledTimes(2); // trace + debug
            expect(sandbox.console.info).toHaveBeenCalledTimes(1);
            expect(sandbox.console.warn).toHaveBeenCalledTimes(1);
            expect(sandbox.console.error).toHaveBeenCalledTimes(1);
        });

        it('should log nothing at SILENT level', () => {
            const log = sandbox.SimpleLogger('test', sandbox.LogLevel.SILENT);

            log.trace('t');
            log.debug('d');
            log.info('i');
            log.warn('w');
            log.error('e');

            expect(sandbox.console.log).not.toHaveBeenCalled();
            expect(sandbox.console.info).not.toHaveBeenCalled();
            expect(sandbox.console.warn).not.toHaveBeenCalled();
            expect(sandbox.console.error).not.toHaveBeenCalled();
        });
    });

    describe('Pre-created logger instances', () => {
        it('should create standard logger instances', () => {
            expect(sandbox.logger).toBeDefined();
            expect(sandbox.generatorLogger).toBeDefined();
            expect(sandbox.workflowLogger).toBeDefined();
            expect(sandbox.comfyuiLogger).toBeDefined();
            expect(sandbox.uiLogger).toBeDefined();
            expect(sandbox.i18nLogger).toBeDefined();
        });

        it('should default to INFO level', () => {
            expect(sandbox.logger.getLevel()).toBe('info');
            expect(sandbox.generatorLogger.getLevel()).toBe('info');
        });
    });
});
