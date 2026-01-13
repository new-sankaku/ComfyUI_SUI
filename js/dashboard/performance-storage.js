// Performance Statistics Storage using localforage
const PerformanceStorage = (function() {
    const store = localforage.createInstance({
        name: 'ComfyUISUI_Performance',
        storeName: 'performanceStats'
    });

    const historyStore = localforage.createInstance({
        name: 'ComfyUISUI_Performance',
        storeName: 'generationHistory'
    });

    // Mode types matching the generation modes
    const MODES = ['T2I', 'T2I_Loop', 'I2I', 'I2I_Loop', 'I2I_Angle', 'Upscale'];
    const MAX_HISTORY_PER_MODE = 100;

    // Default stats structure
    function getDefaultStats() {
        return {
            count: 0,
            totalTime: 0,
            avg: 0,
            min: null,
            max: null,
            lastUpdated: null
        };
    }

    // Get stats for a specific mode
    async function getStats(mode) {
        try {
            const stats = await store.getItem(`stats_${mode}`);
            return stats || getDefaultStats();
        } catch (error) {
            console.error('Error getting stats:', error);
            return getDefaultStats();
        }
    }

    // Get all stats for all modes
    async function getAllStats() {
        const allStats = {};
        for (const mode of MODES) {
            allStats[mode] = await getStats(mode);
        }
        return allStats;
    }

    // Record a generation time for a specific mode
    async function recordTime(mode, timeMs) {
        try {
            const stats = await getStats(mode);

            // Update aggregate stats (single row update)
            stats.count += 1;
            stats.totalTime += timeMs;
            stats.avg = Math.round(stats.totalTime / stats.count);
            stats.min = stats.min === null ? timeMs : Math.min(stats.min, timeMs);
            stats.max = stats.max === null ? timeMs : Math.max(stats.max, timeMs);
            stats.lastUpdated = Date.now();

            await store.setItem(`stats_${mode}`, stats);

            // Also record in history for graph display
            await addToHistory(mode, timeMs);

            return stats;
        } catch (error) {
            console.error('Error recording time:', error);
            return null;
        }
    }

    // Add to history (for graph)
    async function addToHistory(mode, timeMs) {
        try {
            let history = await historyStore.getItem(`history_${mode}`) || [];

            history.push({
                time: timeMs,
                timestamp: Date.now()
            });

            // Keep only last MAX_HISTORY_PER_MODE entries for performance
            if (history.length > MAX_HISTORY_PER_MODE) {
                history = history.slice(-MAX_HISTORY_PER_MODE);
            }

            await historyStore.setItem(`history_${mode}`, history);
            return history;
        } catch (error) {
            console.error('Error adding to history:', error);
            return [];
        }
    }

    // Get history for a specific mode
    async function getHistory(mode) {
        try {
            return await historyStore.getItem(`history_${mode}`) || [];
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
        }
    }

    // Get all history for all modes
    async function getAllHistory() {
        const allHistory = {};
        for (const mode of MODES) {
            allHistory[mode] = await getHistory(mode);
        }
        return allHistory;
    }

    // Clear stats for a specific mode
    async function clearStats(mode) {
        try {
            await store.removeItem(`stats_${mode}`);
            await historyStore.removeItem(`history_${mode}`);
            return true;
        } catch (error) {
            console.error('Error clearing stats:', error);
            return false;
        }
    }

    // Clear all stats
    async function clearAllStats() {
        try {
            for (const mode of MODES) {
                await clearStats(mode);
            }
            return true;
        } catch (error) {
            console.error('Error clearing all stats:', error);
            return false;
        }
    }

    // Get summary statistics across all modes
    async function getSummary() {
        const allStats = await getAllStats();
        let totalCount = 0;
        let totalTime = 0;
        let globalMin = null;
        let globalMax = null;

        for (const mode of MODES) {
            const stats = allStats[mode];
            totalCount += stats.count;
            totalTime += stats.totalTime;
            if (stats.min !== null) {
                globalMin = globalMin === null ? stats.min : Math.min(globalMin, stats.min);
            }
            if (stats.max !== null) {
                globalMax = globalMax === null ? stats.max : Math.max(globalMax, stats.max);
            }
        }

        return {
            totalCount,
            totalTime,
            globalAvg: totalCount > 0 ? Math.round(totalTime / totalCount) : 0,
            globalMin,
            globalMax
        };
    }

    return {
        MODES,
        getStats,
        getAllStats,
        recordTime,
        getHistory,
        getAllHistory,
        clearStats,
        clearAllStats,
        getSummary
    };
})();
