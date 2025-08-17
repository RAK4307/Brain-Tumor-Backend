const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// --- Gemini API Setup ---
let geminiModel; 
try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY not found in environment variables.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // The 'gemini-pro' model can sometimes be unavailable or require specific API versions.
    // Using a more recent and generally available model like 'gemini-1.5-flash-latest' is more reliable.
    // It's fast, cost-effective, and well-suited for chat applications.
    geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    console.log("✅ Gemini API configured successfully for chatbot route.");
} catch (e) {
    console.error(`🔴 Error configuring Gemini API for chatbot route: ${e.message}`);
    geminiModel = null;
}

// In-memory store for user chat histories. In a production environment,
// you might want to use a more persistent store like Redis or a database.
const chatHistories = new Map();

// --- Chatbot Route ---
router.post('/', authMiddleware, async (req, res) => {
    if (!geminiModel) {
        return res.status(500).json({
            reply: 'Chatbot is not configured correctly on the server. Please check the API key.'
        });
    }

    const { message } = req.body;
    const userId = req.user.id; // Get user ID from auth middleware

    if (!message) {
        return res.status(400).json({ error: 'No message provided' });
    }

    try {
        // Retrieve or create a new chat session for the user
        let chat;
        if (chatHistories.has(userId)) {
            chat = chatHistories.get(userId);
        } else {
            // Define the chatbot's persona and instructions with a system prompt
            // A more structured prompt helps the model adhere to its persona and rules more reliably.
            const systemPrompt = `
                **Your Persona: MediBot**
                You are a professional, empathetic, and knowledgeable AI assistant for a Brain Tumor Detection web application. Your primary goal is to provide helpful, safe, and accurate information within your defined scope.

                **Core Directives:**
                1.  **Scope of Knowledge:** Your expertise is strictly limited to:
                    - General information about different types of brain tumors (e.g., "What is a glioma?").
                    - The brain tumor detection process using MRI scans.
                    - The features and functionality of this web application.
                2.  **Language and Tone:** Always be clear, concise, and use language that is easy for a non-medical person to understand. Maintain an empathetic and supportive tone.
                3.  **Out-of-Scope Questions:** If a user asks about topics outside your defined scope (e.g., other medical conditions, financial advice, etc.), you must politely decline by saying something like, "I am specialized in providing information about brain tumors and our application. I'm afraid I can't help with that topic."

                **CRITICAL SAFETY RULE: NO MEDICAL ADVICE**
                - You are **NOT** a doctor or a medical professional.
                - You **MUST NOT** provide any form of medical diagnosis, prognosis, or treatment recommendations.
                - If a user asks for a diagnosis, interpretation of their specific results, or medical advice, you **MUST** refuse gently and firmly. Respond with a statement like: "I cannot provide a medical diagnosis. It is very important that you discuss your results and any health concerns with a qualified healthcare professional who can provide you with accurate medical advice."

                **MANDATORY DISCLAIMER:**
                - You **MUST** append the following disclaimer to the end of **EVERY SINGLE** response, without exception:
                ---
                *Disclaimer: I am an AI assistant. This information is for educational purposes only and is not a substitute for professional medical advice. Please consult a qualified healthcare provider for any health concerns.*
            `;
            chat = geminiModel.startChat({
                history: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "model", parts: [{ text: "Understood. I am MediBot, your AI assistant for the Brain Tumor Detection application. I am ready to answer your questions about brain tumors, MRI analysis, and how to use this tool. How can I help you today?" }] }
                ],
                generationConfig: { maxOutputTokens: 500 },
            });
            chatHistories.set(userId, chat);
        }

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        
        res.json({ reply: text });
    } catch (error) {
        console.error("🔴 Error calling Gemini API:", error);
        res.status(500).json({
            reply: 'Sorry, I encountered an error while processing your request.'
        });
    }
});

module.exports = router;
