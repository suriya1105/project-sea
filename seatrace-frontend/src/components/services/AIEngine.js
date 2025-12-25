// SeaTrace AI Engine - Mock NLP & Context Awareness
// Simulates intelligence by pattern matching user queries against app state

export const processAIQuery = (query, context) => {
    const text = query.toLowerCase();

    // 1. Weather Queries
    if (text.includes('weather') || text.includes('forecast') || text.includes('wind')) {
        return {
            text: "Scanning meteorological satellites... Current signals indicate distinct low-pressure systems in the Northern Quadrant. Wind speeds nominal at 12 knots. Visibility is clear.",
            action: 'highlight_weather',
            data: { type: 'weather', lat: 34.0, lon: 18.0 }
        };
    }

    // 2. Vessel/Ship Status Queries
    if (text.includes('ship') || text.includes('vessel') || text.includes('boat')) {
        const vesselCount = context?.vessels?.length || 0;
        return {
            text: `Connected to AIS Network. Tracking ${vesselCount} active vessels in your sector. Most are operating at standard efficiency. Do you want a report on the nearest tanker?`,
            action: 'focus_map',
            data: { type: 'vessels_view' }
        };
    }

    // 3. Hazard/Spill Queries
    if (text.includes('hazard') || text.includes('spill') || text.includes('oil') || text.includes('danger')) {
        const hazardCount = context?.oilSpills?.length || 0;
        if (hazardCount > 0) {
            return {
                text: `CRITICAL ALERT: Detected ${hazardCount} active environmental hazards. Immediate containment protocol recommended. Tapping hazards on the map now.`,
                action: 'navigate_spills',
                data: { tab: 'spills' }
            };
        } else {
            return {
                text: "No immediate environmental hazards detected in the current sector. Systems are monitoring 24/7.",
                action: 'none'
            };
        }
    }

    // 4. Status/System Queries
    if (text.includes('system') || text.includes('status') || text.includes('health')) {
        return {
            text: "All systems operational. Satellite Uplink: STRONG. AI Core: ONLINE. Security Level: COMMANDER. You are good to go.",
            action: 'none'
        };
    }

    // 5. Default / Fallback
    const fallbacks = [
        "Processing... I can track vessels, analyze weather patterns, or report on oil spills. What is your directive?",
        "Awaiting command. My sensors are focused on the Indian Ocean region.",
        "I am listening. Ask me about fleet status or environmental alerts."
    ];

    return {
        text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
        action: 'none'
    };
};
