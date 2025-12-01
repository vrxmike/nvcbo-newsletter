// --- API Configuration ---
// The API key is left as an empty string.
// The build environment will automatically provide the key.
const apiKey = ""; 
const model = "gemini-2.5-flash-preview-09-2025";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

// --- DOM Elements ---
const agribotButton = document.getElementById('agribot-button');
const agribotPrompt = document.getElementById('agribot-prompt');
const agribotResult = document.getElementById('agribot-result');

const planButton = document.getElementById('plan-button');
const planResult = document.getElementById('plan-result');

// --- Event Listeners ---
agribotButton.addEventListener('click', handleAgriBot);
planButton.addEventListener('click', handleActionPlan);

// --- Feature 1: Agri-Helper Bot ---
async function handleAgriBot() {
    const userQuery = agribotPrompt.value;
    if (!userQuery) {
        agribotResult.textContent = "Please enter a question first.";
        agribotResult.style.display = 'block';
        return;
    }

    setLoading(agribotButton, true);
    agribotResult.style.display = 'none';

    const systemPrompt = `You are "NVCBO's Agri-Helper," an expert AI assistant for NorthernVision CBO.
    Your mission is to help users with questions related to sustainable agriculture, climate resilience, gender equality, and skills training, especially in the context of Kenya and smallholder farmers.
    - Answer the user's question concisely and practically.
    - Maintain a friendly, encouraging, and empowering tone.
    - Always align your answers with NVCBO's mission.
    - If the question is off-topic, gently guide them back.`;
    
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        }
    };

    try {
        const result = await callGeminiApi(payload);
        const text = result.candidates[0].content.parts[0].text;
        agribotResult.textContent = text;
        agribotResult.style.display = 'block';
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        agribotResult.textContent = "Sorry, I couldn't get a response. Please try again later.";
        agribotResult.style.display = 'block';
    } finally {
        setLoading(agribotButton, false);
    }
}

// --- Feature 2: Local Action Plan ---
async function handleActionPlan() {
    setLoading(planButton, true);
    planResult.style.display = 'none';

    const userQuery = `I'm inspired by the work of NVCBO (sustainable agriculture, climate action, financial empowerment, gender equality). 
    Generate a simple, 3-step "Local Action Plan" that I can start in my own community this month. 
    Make the steps concrete and achievable for an individual.
    Frame the response as an encouraging message.`;
    
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }]
    };

    try {
        const result = await callGeminiApi(payload);
        const text = result.candidates[0].content.parts[0].text;
        planResult.textContent = text;
        planResult.style.display = 'block';
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        planResult.textContent = "Sorry, I couldn't generate a plan. Please try again later.";
        planResult.style.display = 'block';
    } finally {
        setLoading(planButton, false);
    }
}

// --- Reusable API Call Logic ---

/**
 * Calls the Gemini API with exponential backoff.
 */
async function callGeminiApi(payload) {
    const fetchWithBackoff = async (retries = 3, delay = 1000) => {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 429 && retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return fetchWithBackoff(retries - 1, delay * 2);
                }
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            return response.json();

        } catch (error) {
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchWithBackoff(retries - 1, delay * 2);
            } else {
                throw error;
            }
        }
    };
    return fetchWithBackoff();
}

/**
 * Toggles the loading state of a button.
 */
function setLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}