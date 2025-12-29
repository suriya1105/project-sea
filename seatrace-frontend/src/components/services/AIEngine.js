// SeaTrace AI Engine - Advanced Contextual NLP v2.0
// Simulates a high-fidelity, "ChatGPT-like" AI Assistant for SeaTrace

/**
 * Main Processing Function
 * Matches user intent and generates a structured, conversational response.
 * @param {string} query - The user's raw text input.
 * @param {object} context - App state (vessels, spills, activeTab, etc.)
 */
export const processAIQuery = (query, context) => {
    const text = query.toLowerCase().trim();

    // --- 0. SAFETY & TRIVIAL CHECKS ---
    if (!text) return generateResponse("I am listening. How can I assist?", 'none');

    // --- 1. PERSONALITY / SMALL TALK ---
    if (match(text, ['hello', 'hi', 'greetings', 'who are you', 'identity'])) {
        return generateResponse(
            "Greetings, Commander. 🫡\n\nI am the **SeaTrace Sentinel**, a specialized AI designed for maritime intelligence and fleet oversight.\n\nI can assist you with:\n• 🚢 **Real-time Vessel Tracking**\n• 🛡️ **Cyber Defense Analysis**\n• 🌿 **Environmental Impact Scans**\n• ⚡ **Storm Prediction Models**\n\nWhat are your orders?",
            'none'
        );
    }

    if (match(text, ['thank', 'good job', 'cool', 'awesome'])) {
        return generateResponse("You are welcome, Commander. Systems remaining in optimal condition. Standing by. ✅", 'none');
    }

    // --- 2. CYBER DEFENSE (Detailed) ---
    if (match(text, ['cyber', 'security', 'hack', 'firewall', 'attack', 'intrusion', 'defense'])) {
        return generateResponse(
            "🔒 **CYBER DEFENSE HUB REPORT**\n\nAnalyzed secure channels: **AES-256 Encrypted**.\n\n• **Firewall Status**: 98% Integrity\n• **Recent Threats**: 3 low-level phishing attempts blocked from Sector 4.\n• **Satellite Uplink**: Stable (14ms latency)\n\nI have flagged IP `192.168.4.X` for suspicious activity. Recommend viewing the Cyber Defense Hub for full logs.",
            'navigate_cyber',
            { tab: 'cyber' }
        );
    }

    // --- 3. STORM WATCH (Detailed) ---
    if (match(text, ['storm', 'weather', 'rain', 'wind', 'hurricane', 'cyclone', 'forecast'])) {
        return generateResponse(
            "⚡ **METEOROLOGICAL INTELLIGENCE**\n\nScanning Doppler Radar... 📡\n\n**Warning**: Storm Front 'Cyclops' detected in Quadrant 7.\n• **Wind Speeds**: Gusts up to 82 knots.\n• **Wave Height**: 4.2 meters (Rising)\n• **Pressure**: 984 hPa (Dropping)\n\n**Advisory**: Reroute all light vessels away from the eastern strait. Initiating Storm Watch visualization...",
            'navigate_storm',
            { tab: 'storm' }
        );
    }

    // --- 4. ECO-SCANNER (Detailed) ---
    if (match(text, ['eco', 'environment', 'carbon', 'pollution', 'toxicity', 'green', 'nature'])) {
        return generateResponse(
            "🌿 **ENVIRONMENTAL SCAN COMPLETE**\n\nRegion: **Indian Ocean - Sector 7**\n\n• **Water Quality**: Nominal (Toxicity Index: 0.12)\n• **Carbon PPM**: 412 (↓ 2.4% from yesterday)\n• **Biodiversity**: Whale migration detected in southern corridor.\n\nNo critical hazards found. Monitoring continues. Opening Eco-Scanner...",
            'navigate_eco',
            { tab: 'eco' }
        );
    }

    // --- 5. FLEET & VESSEL OPERATIONS (Context Aware) ---
    if (match(text, ['ship', 'vessel', 'fleet', 'boat', 'count', 'status'])) {
        const count = context?.vessels?.length || 'Unknown';
        const active = context?.vessels?.filter(v => v.status === 'Active').length || 0;
        const docked = typeof count === 'number' ? count - active : 0;

        return generateResponse(
            `⚓ **FLEET OPS SUMMARY**\n\nI am currently tracking **${count} vessels** in your registry.\n\n• **Active Duty**: ${active}\n• **Docked/Maintenance**: ${docked}\n\nGlobal supply chain efficiency is rated at **94%**. Do you wish to see the specific coordinates on the Live Map?`,
            'focus_map',
            { tab: 'vessels' }
        );
    }

    // --- 6. OIL SPILLS / HAZARDS ---
    if (match(text, ['spill', 'oil', 'hazard', 'danger', 'accident', 'leak'])) {
        const hazardCount = context?.oilSpills?.length || 0;

        if (hazardCount > 0) {
            return generateResponse(
                `⚠️ **CRITICAL HAZARD ALERT**\n\nMy sensors have detected **${hazardCount} active oil spill(s)**.\n\n• **Severity**: HIGH\n• **Containment Status**: Pending\n\nTeams have been dispatched. I am redirecting you to the Hazard Map immediately.`,
                'navigate_spills',
                { tab: 'map' }
            );
        } else {
            return generateResponse(
                "✅ **HAZARD SCAN: CLEAR**\n\nNo active oil spills or environmental disasters detected in the current sector. Routine satellite sweeps will continue every 15 minutes.",
                'none'
            );
        }
    }

    // --- 7. SYSTEM / ADMIN ---
    if (match(text, ['system', 'diagnostic', 'admin', 'user', 'login'])) {
        return generateResponse(
            "🛠️ **SYSTEM DIAGNOSTIC**\n\n• **AI Core**: ONLINE\n• **Database**: SYNCHRONIZED\n• **Current User**: Commander (Level 5 Clearance)\n\nAll operating parameters are within normal limits. Accessing Admin Panel...",
            'navigate_admin',
            { tab: 'admin' } // Requires admin permission check on frontend usually
        );
    }

    // --- 8. FALLBACK (INTELLIGENT) ---
    return generateResponse(
        "🧠 **PROCESSING...**\n\nI analyzed your query but could not find a specific module match. \n\n**Try asking me about:**\n• \"Fleet Status\"\n• \"Weather Forecast\"\n• \"Cyber Threats\"\n• \"Environmental Report\"\n\nI can also navigate you to any tab (e.g. \"Go to Settings\").",
        'none'
    );
};

// --- HELPER FUNCTIONS ---

// Simple regex matching wrapper
const match = (text, keywords) => {
    return keywords.some(keyword => text.includes(keyword));
};

// Response Formatter
const generateResponse = (text, action, data = {}) => {
    return {
        text: text,
        action: action,
        data: data
    };
};
