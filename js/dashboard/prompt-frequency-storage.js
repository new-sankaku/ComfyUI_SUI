// Prompt Tag Frequency Storage using localforage
const PromptFrequencyStorage = (function() {
    const store = localforage.createInstance({
        name: 'ComfyUISUI_PromptFrequency',
        storeName: 'tagFrequency'
    });

    const MAX_TAGS = 500; // Maximum unique tags to store

    // Parse prompt into individual tags
    function parsePrompt(prompt) {
        if (!prompt || typeof prompt !== 'string') return [];

        // Split by comma, clean up whitespace, filter empty strings
        const tags = prompt
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0 && tag.length < 100); // Filter empty and very long strings

        // Remove duplicates within same prompt
        return [...new Set(tags)];
    }

    // Get all tag frequencies
    async function getAllFrequencies() {
        try {
            const data = await store.getItem('frequencies');
            return data || {};
        } catch (error) {
            console.error('Error getting frequencies:', error);
            return {};
        }
    }

    // Record tags from a prompt
    async function recordPrompt(prompt) {
        try {
            const tags = parsePrompt(prompt);
            if (tags.length === 0) return null;

            const frequencies = await getAllFrequencies();
            const now = Date.now();

            for (const tag of tags) {
                if (frequencies[tag]) {
                    frequencies[tag].count += 1;
                    frequencies[tag].lastUsed = now;
                } else {
                    frequencies[tag] = {
                        count: 1,
                        firstUsed: now,
                        lastUsed: now
                    };
                }
            }

            // If we have too many tags, remove least used ones
            const tagList = Object.entries(frequencies);
            if (tagList.length > MAX_TAGS) {
                // Sort by count (ascending), then by lastUsed (ascending)
                tagList.sort((a, b) => {
                    if (a[1].count !== b[1].count) {
                        return a[1].count - b[1].count;
                    }
                    return a[1].lastUsed - b[1].lastUsed;
                });

                // Remove excess tags (least used)
                const toRemove = tagList.length - MAX_TAGS;
                for (let i = 0; i < toRemove; i++) {
                    delete frequencies[tagList[i][0]];
                }
            }

            await store.setItem('frequencies', frequencies);
            return frequencies;
        } catch (error) {
            console.error('Error recording prompt:', error);
            return null;
        }
    }

    // Get top N most used tags
    async function getTopTags(limit = 20) {
        try {
            const frequencies = await getAllFrequencies();
            const tagList = Object.entries(frequencies);

            // Sort by count (descending)
            tagList.sort((a, b) => b[1].count - a[1].count);

            return tagList.slice(0, limit).map(([tag, data]) => ({
                tag,
                count: data.count,
                lastUsed: data.lastUsed
            }));
        } catch (error) {
            console.error('Error getting top tags:', error);
            return [];
        }
    }

    // Get recently used tags
    async function getRecentTags(limit = 20) {
        try {
            const frequencies = await getAllFrequencies();
            const tagList = Object.entries(frequencies);

            // Sort by lastUsed (descending)
            tagList.sort((a, b) => b[1].lastUsed - a[1].lastUsed);

            return tagList.slice(0, limit).map(([tag, data]) => ({
                tag,
                count: data.count,
                lastUsed: data.lastUsed
            }));
        } catch (error) {
            console.error('Error getting recent tags:', error);
            return [];
        }
    }

    // Get tag statistics
    async function getStats() {
        try {
            const frequencies = await getAllFrequencies();
            const tagList = Object.entries(frequencies);

            if (tagList.length === 0) {
                return {
                    totalUniqueTags: 0,
                    totalUsage: 0,
                    avgUsagePerTag: 0
                };
            }

            const totalUsage = tagList.reduce((sum, [, data]) => sum + data.count, 0);

            return {
                totalUniqueTags: tagList.length,
                totalUsage,
                avgUsagePerTag: Math.round(totalUsage / tagList.length * 10) / 10
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return {
                totalUniqueTags: 0,
                totalUsage: 0,
                avgUsagePerTag: 0
            };
        }
    }

    // Clear all frequencies
    async function clearAll() {
        try {
            await store.removeItem('frequencies');
            return true;
        } catch (error) {
            console.error('Error clearing frequencies:', error);
            return false;
        }
    }

    // Search for tags containing a string
    async function searchTags(query, limit = 10) {
        try {
            const frequencies = await getAllFrequencies();
            const queryLower = query.toLowerCase();

            const matches = Object.entries(frequencies)
                .filter(([tag]) => tag.includes(queryLower))
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, limit)
                .map(([tag, data]) => ({
                    tag,
                    count: data.count
                }));

            return matches;
        } catch (error) {
            console.error('Error searching tags:', error);
            return [];
        }
    }

    return {
        recordPrompt,
        getAllFrequencies,
        getTopTags,
        getRecentTags,
        getStats,
        clearAll,
        searchTags,
        parsePrompt
    };
})();
