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

    const timeStore = localforage.createInstance({
        name: 'ComfyUISUI_Performance',
        storeName: 'timeBasedStats'
    });

    // Mode types matching the generation modes
    const MODES = ['T2I', 'T2I_Loop', 'I2I', 'I2I_Loop', 'I2I_Angle', 'Upscale'];
    const MAX_HISTORY_PER_MODE = 100;
    const MAX_DAILY_RECORDS = 90; // Keep 90 days of data

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
            const now = Date.now();

            // Update aggregate stats (single row update)
            stats.count += 1;
            stats.totalTime += timeMs;
            stats.avg = Math.round(stats.totalTime / stats.count);
            stats.min = stats.min === null ? timeMs : Math.min(stats.min, timeMs);
            stats.max = stats.max === null ? timeMs : Math.max(stats.max, timeMs);
            stats.lastUpdated = now;

            await store.setItem(`stats_${mode}`, stats);

            // Also record in history for graph display
            await addToHistory(mode, timeMs);

            // Record time-based stats
            await recordHourlyStats(now);
            await recordDailyStats(now);

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

    // Record hourly statistics (for heatmap)
    async function recordHourlyStats(timestamp) {
        try {
            const date = new Date(timestamp);
            const hour = date.getHours();
            const dayOfWeek = date.getDay(); // 0 = Sunday

            let hourlyData = await timeStore.getItem('hourlyStats') || {};

            // Initialize if needed
            if (!hourlyData[dayOfWeek]) {
                hourlyData[dayOfWeek] = {};
            }
            if (!hourlyData[dayOfWeek][hour]) {
                hourlyData[dayOfWeek][hour] = 0;
            }

            hourlyData[dayOfWeek][hour] += 1;

            await timeStore.setItem('hourlyStats', hourlyData);
            return hourlyData;
        } catch (error) {
            console.error('Error recording hourly stats:', error);
            return {};
        }
    }

    // Get hourly statistics for heatmap
    async function getHourlyStats() {
        try {
            return await timeStore.getItem('hourlyStats') || {};
        } catch (error) {
            console.error('Error getting hourly stats:', error);
            return {};
        }
    }

    // Record daily statistics (for trend graph)
    async function recordDailyStats(timestamp) {
        try {
            const date = new Date(timestamp);
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

            let dailyData = await timeStore.getItem('dailyStats') || {};

            if (!dailyData[dateKey]) {
                dailyData[dateKey] = 0;
            }
            dailyData[dateKey] += 1;

            // Clean old entries (keep only MAX_DAILY_RECORDS days)
            const keys = Object.keys(dailyData).sort();
            if (keys.length > MAX_DAILY_RECORDS) {
                const toRemove = keys.slice(0, keys.length - MAX_DAILY_RECORDS);
                toRemove.forEach(key => delete dailyData[key]);
            }

            await timeStore.setItem('dailyStats', dailyData);
            return dailyData;
        } catch (error) {
            console.error('Error recording daily stats:', error);
            return {};
        }
    }

    // Get daily statistics for trend graph
    async function getDailyStats() {
        try {
            return await timeStore.getItem('dailyStats') || {};
        } catch (error) {
            console.error('Error getting daily stats:', error);
            return {};
        }
    }

    // Get weekly aggregated statistics
    async function getWeeklyStats() {
        try {
            const dailyData = await getDailyStats();
            const weeklyData = {};

            Object.entries(dailyData).forEach(([dateKey, count]) => {
                const date = new Date(dateKey);
                // Get the Monday of the week
                const day = date.getDay();
                const diff = date.getDate() - day + (day === 0 ? -6 : 1);
                const monday = new Date(date.setDate(diff));
                const weekKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;

                if (!weeklyData[weekKey]) {
                    weeklyData[weekKey] = 0;
                }
                weeklyData[weekKey] += count;
            });

            return weeklyData;
        } catch (error) {
            console.error('Error getting weekly stats:', error);
            return {};
        }
    }

    // Get monthly aggregated statistics
    async function getMonthlyStats() {
        try {
            const dailyData = await getDailyStats();
            const monthlyData = {};

            Object.entries(dailyData).forEach(([dateKey, count]) => {
                const monthKey = dateKey.substring(0, 7); // YYYY-MM

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = 0;
                }
                monthlyData[monthKey] += count;
            });

            return monthlyData;
        } catch (error) {
            console.error('Error getting monthly stats:', error);
            return {};
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
            // Also clear time-based stats
            await timeStore.removeItem('hourlyStats');
            await timeStore.removeItem('dailyStats');
            // Also clear launch info
            await store.removeItem('launchInfo');
            return true;
        } catch (error) {
            console.error('Error clearing all stats:', error);
            return false;
        }
    }

    // Record application launch
    async function recordLaunch() {
        try {
            const now = Date.now();
            let launchInfo = await store.getItem('launchInfo');

            if (!launchInfo) {
                launchInfo = {
                    count: 0,
                    firstLaunchDate: now,
                    lastLaunchDate: now
                };
            }

            launchInfo.count += 1;
            launchInfo.lastLaunchDate = now;

            await store.setItem('launchInfo', launchInfo);
            return launchInfo;
        } catch (error) {
            console.error('Error recording launch:', error);
            return null;
        }
    }

    // Get launch information
    async function getLaunchInfo() {
        try {
            const launchInfo = await store.getItem('launchInfo');
            return launchInfo || {
                count: 0,
                firstLaunchDate: null,
                lastLaunchDate: null
            };
        } catch (error) {
            console.error('Error getting launch info:', error);
            return {
                count: 0,
                firstLaunchDate: null,
                lastLaunchDate: null
            };
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
        getHourlyStats,
        getDailyStats,
        getWeeklyStats,
        getMonthlyStats,
        clearStats,
        clearAllStats,
        getSummary,
        recordLaunch,
        getLaunchInfo
    };
})();
