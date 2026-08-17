import { describe, it, expect, beforeAll } from 'vitest';
import { loadScript } from '../helpers/load-script.js';

describe('prompt-util.js', () => {
    let sandbox;

    beforeAll(() => {
        sandbox = loadScript('js/prompt/prompt-util.js', {
            // Stub dependencies that prompt-util.js references
            $: (id) => null,
            promptTagify: null,
            wildcardGetPromptText: () => '',
            wildcardProcessPrompt: undefined,
            wildcardReplaceAndGetPrompt: undefined,
        });
    });

    describe('removePromptComments', () => {
        it('should return empty string for falsy input', () => {
            expect(sandbox.removePromptComments('')).toBe('');
            expect(sandbox.removePromptComments(null)).toBe('');
            expect(sandbox.removePromptComments(undefined)).toBe('');
        });

        it('should remove comments after #', () => {
            expect(sandbox.removePromptComments('hello # comment')).toBe('hello ');
        });

        it('should handle multiple lines', () => {
            const input = 'line1 # comment1\nline2\nline3 # comment3';
            const expected = 'line1 \nline2\nline3 ';
            expect(sandbox.removePromptComments(input)).toBe(expected);
        });

        it('should return text unchanged if no comments', () => {
            expect(sandbox.removePromptComments('no comments here')).toBe('no comments here');
        });

        it('should handle line starting with #', () => {
            expect(sandbox.removePromptComments('# full comment')).toBe('');
        });

        it('should handle only # character', () => {
            expect(sandbox.removePromptComments('#')).toBe('');
        });
    });

    describe('expandWildcards', () => {
        it('should expand single-option wildcard', () => {
            const result = sandbox.expandWildcards('a __hello__ b');
            expect(result).toBe('a hello b');
        });

        it('should pick from multiple options', () => {
            const result = sandbox.expandWildcards('__red|blue|green__');
            expect(['red', 'blue', 'green']).toContain(result);
        });

        it('should handle multiple wildcards in same prompt', () => {
            const result = sandbox.expandWildcards('__a__ and __b__');
            expect(result).toBe('a and b');
        });

        it('should return text unchanged if no wildcards', () => {
            expect(sandbox.expandWildcards('no wildcards here')).toBe('no wildcards here');
        });

        it('should handle empty string', () => {
            expect(sandbox.expandWildcards('')).toBe('');
        });

        it('should trim whitespace in options', () => {
            const result = sandbox.expandWildcards('__  hello  __');
            expect(result).toBe('hello');
        });
    });
});
