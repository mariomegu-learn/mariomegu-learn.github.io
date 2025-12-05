// ============================================
// Data Generator Module
// Generates realistic cyberthreat data
// ============================================

const DataGenerator = (function () {
    'use strict';

    // Country database with coordinates and attack probabilities
    const COUNTRIES = [
        // High-risk source countries
        { name: 'China', code: 'CN', flag: '🇨🇳', lat: 35.8617, lon: 104.1954, sourceWeight: 25, targetWeight: 10 },
        { name: 'Russia', code: 'RU', flag: '🇷🇺', lat: 61.5240, lon: 105.3188, sourceWeight: 20, targetWeight: 8 },
        { name: 'North Korea', code: 'KP', flag: '🇰🇵', lat: 40.3399, lon: 127.5101, sourceWeight: 15, targetWeight: 2 },
        { name: 'Iran', code: 'IR', flag: '🇮🇷', lat: 32.4279, lon: 53.6880, sourceWeight: 12, targetWeight: 5 },
        { name: 'Vietnam', code: 'VN', flag: '🇻🇳', lat: 14.0583, lon: 108.2772, sourceWeight: 8, targetWeight: 4 },

        // High-risk target countries
        { name: 'United States', code: 'US', flag: '🇺🇸', lat: 37.0902, lon: -95.7129, sourceWeight: 5, targetWeight: 30 },
        { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', lat: 55.3781, lon: -3.4360, sourceWeight: 3, targetWeight: 15 },
        { name: 'Germany', code: 'DE', flag: '🇩🇪', lat: 51.1657, lon: 10.4515, sourceWeight: 2, targetWeight: 12 },
        { name: 'France', code: 'FR', flag: '🇫🇷', lat: 46.2276, lon: 2.2137, sourceWeight: 2, targetWeight: 10 },
        { name: 'Japan', code: 'JP', flag: '🇯🇵', lat: 36.2048, lon: 138.2529, sourceWeight: 1, targetWeight: 12 },
        { name: 'South Korea', code: 'KR', flag: '🇰🇷', lat: 35.9078, lon: 127.7669, sourceWeight: 2, targetWeight: 14 },
        { name: 'Australia', code: 'AU', flag: '🇦🇺', lat: -25.2744, lon: 133.7751, sourceWeight: 1, targetWeight: 8 },
        { name: 'Canada', code: 'CA', flag: '🇨🇦', lat: 56.1304, lon: -106.3468, sourceWeight: 1, targetWeight: 9 },

        // Latin America
        { name: 'Brazil', code: 'BR', flag: '🇧🇷', lat: -14.2350, lon: -51.9253, sourceWeight: 6, targetWeight: 11 },
        { name: 'Mexico', code: 'MX', flag: '🇲🇽', lat: 23.6345, lon: -102.5528, sourceWeight: 4, targetWeight: 9 },
        { name: 'Colombia', code: 'CO', flag: '🇨🇴', lat: 4.5709, lon: -74.2973, sourceWeight: 3, targetWeight: 7 },
        { name: 'Argentina', code: 'AR', flag: '🇦🇷', lat: -38.4161, lon: -63.6167, sourceWeight: 2, targetWeight: 6 },

        // Europe
        { name: 'Spain', code: 'ES', flag: '🇪🇸', lat: 40.4637, lon: -3.7492, sourceWeight: 2, targetWeight: 8 },
        { name: 'Italy', code: 'IT', flag: '🇮🇹', lat: 41.8719, lon: 12.5674, sourceWeight: 2, targetWeight: 7 },
        { name: 'Netherlands', code: 'NL', flag: '🇳🇱', lat: 52.1326, lon: 5.2913, sourceWeight: 3, targetWeight: 9 },
        { name: 'Poland', code: 'PL', flag: '🇵🇱', lat: 51.9194, lon: 19.1451, sourceWeight: 3, targetWeight: 6 },
        { name: 'Sweden', code: 'SE', flag: '🇸🇪', lat: 60.1282, lon: 18.6435, sourceWeight: 1, targetWeight: 5 },

        // Asia
        { name: 'India', code: 'IN', flag: '🇮🇳', lat: 20.5937, lon: 78.9629, sourceWeight: 10, targetWeight: 13 },
        { name: 'Singapore', code: 'SG', flag: '🇸🇬', lat: 1.3521, lon: 103.8198, sourceWeight: 2, targetWeight: 10 },
        { name: 'Thailand', code: 'TH', flag: '🇹🇭', lat: 15.8700, lon: 100.9925, sourceWeight: 5, targetWeight: 6 },
        { name: 'Indonesia', code: 'ID', flag: '🇮🇩', lat: -0.7893, lon: 113.9213, sourceWeight: 6, targetWeight: 7 },
        { name: 'Malaysia', code: 'MY', flag: '🇲🇾', lat: 4.2105, lon: 101.9758, sourceWeight: 4, targetWeight: 5 },

        // Middle East & Africa
        { name: 'Israel', code: 'IL', flag: '🇮🇱', lat: 31.0461, lon: 34.8516, sourceWeight: 3, targetWeight: 12 },
        { name: 'UAE', code: 'AE', flag: '🇦🇪', lat: 23.4241, lon: 53.8478, sourceWeight: 2, targetWeight: 8 },
        { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', lat: 23.8859, lon: 45.0792, sourceWeight: 2, targetWeight: 7 },
        { name: 'South Africa', code: 'ZA', flag: '🇿🇦', lat: -30.5595, lon: 22.9375, sourceWeight: 3, targetWeight: 6 },
        { name: 'Turkey', code: 'TR', flag: '🇹🇷', lat: 38.9637, lon: 35.2433, sourceWeight: 5, targetWeight: 8 },

        // Others
        { name: 'Ukraine', code: 'UA', flag: '🇺🇦', lat: 48.3794, lon: 31.1656, sourceWeight: 4, targetWeight: 15 },
        { name: 'Romania', code: 'RO', flag: '🇷🇴', lat: 45.9432, lon: 24.9668, sourceWeight: 5, targetWeight: 5 },
        { name: 'Bulgaria', code: 'BG', flag: '🇧🇬', lat: 42.7339, lon: 25.4858, sourceWeight: 4, targetWeight: 4 },
    ];

    // Threat types with colors and probabilities
    const THREAT_TYPES = [
        { id: 'malware', name: 'Malware', color: '#ff3366', weight: 30 },
        { id: 'phishing', name: 'Phishing', color: '#00d9ff', weight: 25 },
        { id: 'ddos', name: 'DDoS', color: '#9d4edd', weight: 15 },
        { id: 'ransomware', name: 'Ransomware', color: '#ff00ff', weight: 12 },
        { id: 'web-attack', name: 'Web Attack', color: '#00ff88', weight: 13 },
        { id: 'exploit', name: 'Exploit', color: '#ff6b35', weight: 5 },
    ];

    // Weighted random selection
    function weightedRandom(items, weightKey) {
        const totalWeight = items.reduce((sum, item) => sum + item[weightKey], 0);
        let random = Math.random() * totalWeight;

        for (let item of items) {
            random -= item[weightKey];
            if (random <= 0) {
                return item;
            }
        }

        return items[items.length - 1];
    }

    // Generate a single attack
    function generateAttack() {
        const source = weightedRandom(COUNTRIES, 'sourceWeight');
        let target;

        // Ensure source and target are different
        do {
            target = weightedRandom(COUNTRIES, 'targetWeight');
        } while (target.code === source.code);

        const threatType = weightedRandom(THREAT_TYPES, 'weight');

        return {
            id: `attack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            source: {
                country: source.name,
                code: source.code,
                flag: source.flag,
                lat: source.lat,
                lon: source.lon,
            },
            target: {
                country: target.name,
                code: target.code,
                flag: target.flag,
                lat: target.lat,
                lon: target.lon,
            },
            threat: {
                type: threatType.id,
                name: threatType.name,
                color: threatType.color,
            },
            severity: Math.floor(Math.random() * 10) + 1, // 1-10
        };
    }

    // Attack stream manager
    class AttackStream {
        constructor() {
            this.listeners = [];
            this.isRunning = false;
            this.intervalId = null;
            this.speed = 1; // 1x speed
            this.baseInterval = 800; // Base interval in ms
        }

        start() {
            if (this.isRunning) return;

            this.isRunning = true;
            this.scheduleNext();
        }

        stop() {
            this.isRunning = false;
            if (this.intervalId) {
                clearTimeout(this.intervalId);
                this.intervalId = null;
            }
        }

        scheduleNext() {
            if (!this.isRunning) return;

            // Variable interval for more realistic timing
            const variance = Math.random() * 0.5 + 0.75; // 0.75 to 1.25
            const interval = (this.baseInterval / this.speed) * variance;

            this.intervalId = setTimeout(() => {
                const attack = generateAttack();
                this.emit(attack);
                this.scheduleNext();
            }, interval);
        }

        setSpeed(speed) {
            this.speed = speed;
        }

        on(callback) {
            this.listeners.push(callback);
        }

        emit(attack) {
            this.listeners.forEach(callback => callback(attack));
        }
    }

    // Public API
    return {
        COUNTRIES,
        THREAT_TYPES,
        generateAttack,
        createStream: () => new AttackStream(),
    };
})();

// Make available globally
window.DataGenerator = DataGenerator;
