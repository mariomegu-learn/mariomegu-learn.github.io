// ============================================
// Statistics Module
// Tracks and displays attack statistics
// ============================================

const Statistics = (function () {
    'use strict';

    const stats = {
        total: 0,
        byType: {
            malware: 0,
            phishing: 0,
            ddos: 0,
            ransomware: 0,
            'web-attack': 0,
            exploit: 0,
        },
        byCountry: new Map(),
        recentAttacks: [],
    };

    const MAX_RECENT = 20;
    const MAX_TOP_TARGETS = 10;

    // Update statistics with new attack
    function recordAttack(attack) {
        stats.total++;
        stats.byType[attack.threat.type]++;

        // Track target countries
        const targetCountry = attack.target.country;
        const currentCount = stats.byCountry.get(targetCountry) || 0;
        stats.byCountry.set(targetCountry, currentCount + 1);

        // Add to recent attacks
        stats.recentAttacks.unshift(attack);
        if (stats.recentAttacks.length > MAX_RECENT) {
            stats.recentAttacks.pop();
        }

        updateUI(attack);
    }

    // Update UI elements
    function updateUI(attack) {
        // Update header stats
        document.getElementById('total-attacks').textContent = formatNumber(stats.total);
        document.getElementById('countries-affected').textContent = stats.byCountry.size;
        document.getElementById('active-threats').textContent = AttackVisualizer.getActiveCount();

        // Update threat type counters
        Object.keys(stats.byType).forEach(type => {
            const element = document.getElementById(`stat-${type}`);
            if (element) {
                element.textContent = formatNumber(stats.byType[type]);
            }
        });

        // Update live feed
        updateLiveFeed(attack);

        // Update top targets
        updateTopTargets();

        // Update chart (throttled)
        throttledUpdateChart();
    }

    // Update live feed
    function updateLiveFeed(attack) {
        const feedContainer = document.getElementById('live-feed');
        if (!feedContainer) return;

        const feedItem = document.createElement('div');
        feedItem.className = `feed-item ${attack.threat.type}`;

        const timeStr = new Date(attack.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });

        feedItem.innerHTML = `
            <div class="feed-item-header">
                <span class="feed-item-type">${attack.threat.name}</span>
                <span class="feed-item-time">${timeStr}</span>
            </div>
            <div class="feed-item-route">
                <span class="country-flag">${attack.source.flag}</span>
                ${attack.source.country}
                →
                <span class="country-flag">${attack.target.flag}</span>
                ${attack.target.country}
            </div>
        `;

        feedContainer.insertBefore(feedItem, feedContainer.firstChild);

        // Remove old items
        while (feedContainer.children.length > MAX_RECENT) {
            feedContainer.removeChild(feedContainer.lastChild);
        }

        // Trigger animation
        setTimeout(() => feedItem.classList.add('visible'), 10);
    }

    // Update top targets list
    function updateTopTargets() {
        const targetsContainer = document.getElementById('top-targets');
        if (!targetsContainer) return;

        // Sort countries by attack count
        const sortedCountries = Array.from(stats.byCountry.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, MAX_TOP_TARGETS);

        targetsContainer.innerHTML = sortedCountries.map(([country, count], index) => {
            const countryData = DataGenerator.COUNTRIES.find(c => c.name === country);
            const flag = countryData ? countryData.flag : '🌍';

            return `
                <div class="target-item">
                    <div class="target-rank">${index + 1}</div>
                    <div class="target-flag">${flag}</div>
                    <div class="target-info">
                        <div class="target-country">${country}</div>
                        <div class="target-count">${formatNumber(count)} ataques</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Chart update (using canvas)
    let chartUpdateTimeout;
    function throttledUpdateChart() {
        clearTimeout(chartUpdateTimeout);
        chartUpdateTimeout = setTimeout(updateChart, 500);
    }

    function updateChart() {
        const canvas = document.getElementById('threat-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        const height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const displayWidth = canvas.offsetWidth;
        const displayHeight = canvas.offsetHeight;

        // Clear canvas
        ctx.clearRect(0, 0, displayWidth, displayHeight);

        // Calculate total for percentages
        const total = Object.values(stats.byType).reduce((sum, val) => sum + val, 0);
        if (total === 0) return;

        // Draw bars
        const barHeight = 20;
        const barSpacing = 10;
        const maxBarWidth = displayWidth - 100;

        const threatTypes = [
            { id: 'malware', name: 'Malware', color: '#ff3366' },
            { id: 'phishing', name: 'Phishing', color: '#00d9ff' },
            { id: 'ddos', name: 'DDoS', color: '#9d4edd' },
            { id: 'ransomware', name: 'Ransomware', color: '#ff00ff' },
            { id: 'web-attack', name: 'Web Attack', color: '#00ff88' },
            { id: 'exploit', name: 'Exploit', color: '#ff6b35' },
        ];

        let y = 10;

        threatTypes.forEach(threat => {
            const count = stats.byType[threat.id];
            const percentage = (count / total) * 100;
            const barWidth = (count / total) * maxBarWidth;

            // Draw bar background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.fillRect(80, y, maxBarWidth, barHeight);

            // Draw bar
            ctx.fillStyle = threat.color;
            ctx.fillRect(80, y, barWidth, barHeight);

            // Draw label
            ctx.fillStyle = '#a0aec0';
            ctx.font = '12px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(threat.name, 75, y + 14);

            // Draw percentage
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.fillText(`${percentage.toFixed(1)}%`, 85 + maxBarWidth, y + 14);

            y += barHeight + barSpacing;
        });
    }

    // Format numbers with commas
    function formatNumber(num) {
        return num.toLocaleString('es-ES');
    }

    // Reset statistics
    function reset() {
        stats.total = 0;
        stats.byType = {
            malware: 0,
            phishing: 0,
            ddos: 0,
            ransomware: 0,
            'web-attack': 0,
            exploit: 0,
        };
        stats.byCountry.clear();
        stats.recentAttacks = [];

        updateUI({ threat: { type: 'malware' } }); // Dummy update to refresh UI
    }

    // Public API
    return {
        recordAttack,
        reset,
        getStats: () => stats,
    };
})();

// Make available globally
window.Statistics = Statistics;
