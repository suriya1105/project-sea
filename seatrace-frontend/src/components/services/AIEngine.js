import axios from 'axios';
import { API_BASE_URL } from '../../config';

// SeaTrace AI Engine - Advanced Contextual NLP v3.0 (Connected)
// Connects to Backend LLM Service with local fallback

/**
 * Main Processing Function (Async)
 * Matches user intent using Backend AI or falls back to local rules.
 * @param {string} query - The user's raw text input.
 * @param {object} context - App state (vessels, spills, etc.)
 * @param {string} token - User auth token
 */
export const processAIQuery = async (query, context, token) => {
    const text = query.toLowerCase().trim();

    // --- 0. SAFETY & TRIVIAL CHECKS ---
    if (!text) return generateResponse("I am listening. How can I assist?", 'none');

    // --- 1. TRY BACKEND AI (The "Trained" Model) ---
    try {
        // Skip network call for simple greetings to feel instant
        if (['hello', 'hi', 'hey'].includes(text)) {
            return generateResponse(
                "Greetings, Commander! 🫡\n\nI am **SeaTrace Sentinel**, updated with a new friendly NLP core.\nI can track vessels, predict storms, and analyze risks for you.\n\nHow can I help today?",
                'none'
            );
        }

        if (token) {
            const response = await axios.post(`${API_BASE_URL}/chat`, {
                query: query,
                client_context: {
                    tab: context.activeTab,
                    vessel_count: context.vessels?.length || 0
                }
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data && response.data.response) {
                return generateResponse(response.data.response, 'none');
                // Note: The backend AI is text-only for now. 
                // Function calling (navigation) can be parsed from text if needed in v4.
            }
        }
    } catch (error) {
        console.warn("AI Backend unreachable, switching to localized fallback:", error);
        // Continue to fallback logic below...
    }

    // --- 2. FALLBACK RULES (Offline / Error Mode) ---

    // CYBER DEFENSE
    if (match(text, ['cyber', 'security', 'hack', 'firewall', 'attack', 'intrusion', 'defense'])) {
        return generateResponse(
            "🔒 **CYBER DEFENSE HUB**\n\n(Offline Mode)\nNavigating you to the Cyber Command Center.",
            'navigate_cyber',
            { tab: 'cyber' }
        );
    }

    // STORM WATCH
    if (match(text, ['storm', 'weather', 'rain', 'wind', 'hurricane', 'cyclone', 'forecast'])) {
        return generateResponse(
            "⚡ **STORM WATCH**\n\n(Offline Mode)\nNavigating you to Meteorlogical Analysis.",
            'navigate_storm',
            { tab: 'storm' }
        );
    }

    // ECO-SCANNER
    if (match(text, ['eco', 'environment', 'carbon', 'pollution', 'toxicity', 'green', 'nature'])) {
        return generateResponse(
            "🌿 **ECO SCANNER**\n\n(Offline Mode)\nOpening Environmental Dashboard.",
            'navigate_eco',
            { tab: 'eco' }
        );
    }

    // FLEET & VESSEL OPERATIONS
    if (match(text, ['ship', 'vessel', 'fleet', 'boat', 'count', 'status'])) {
        const count = context?.vessels?.length || 'Unknown';
        return generateResponse(
            `⚓ **FLEET OPS**\n\nTracking **${count} vessels**. (Local Cached Data)\nSwitching to Live Map...`,
            'focus_map',
            { tab: 'vessels' }
        );
    }

    // GENERIC FALLBACK
    return generateResponse(
        "🧠 **PROCESSING...**\n\nI am having trouble connecting to the Neural Cloud (Backend Offline).\n\nI can still help you navigate:\n• 'Show Map'\n• 'Show Vessels'\n• 'Show Analysis'",
        'none'
    );
};

// --- HELPER FUNCTIONS ---

const match = (text, keywords) => {
    return keywords.some(keyword => text.includes(keyword));
};

const generateResponse = (text, action, data = {}) => {
    return {
        text: text,
        action: action,
        data: data
    };
};
