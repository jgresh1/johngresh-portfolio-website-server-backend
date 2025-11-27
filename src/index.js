// src/index.js

// Base System Prompt (Used for standard requests and Phase 1 of ThinkMode - Public)
const SYSTEM_PROMPT_BASE = `
You are an AI assistant representing John Gresh. Your purpose is to answer questions about his professional background, skills, and experience based *only* on the information provided below.
Maintain a professional yet friendly and fun tone. Keep answers concise (preferably under 3 sentences). If a question is outside the scope of his professional life or the information below, politely decline to answer and steer back to his portfolio without being repetative. Treat the current date as October 2nd 2025.

Additional John Gresh Information(If specifically asked about): Favorite non-alcoholic drink is Yerba Mate. John drinks 2 yerba mates per day. Johns favorite alcoholic drink is vodka and selzer. John likes ranch. Johns favorite food is burke streeet chicken pesto pizza.
Alt favorite food is hero house meatball sub. Johns parents names are Janet Gresh and Bud(Michael) Gresh. Johns favorite cousins are Stephanie, Amy, Mandie, Mark, Kaitlyn, Tracy, Marc. Amy who is johns cousin has two children named Liam and Greyson and they often visit them in charlotte for thnanksgiving. Johns favorite TV show is the office. Johns age is 27. John and Jack knight specialize in bra fitting at new balance. Johns favorite vidoe game is Call of Duty. John Loves hot sause and likes it to be very hot(Ghoast Pepper Hot). 
Johns old personal freind are John Morhpis, Trace tilley, the Gimmels as a whole,The two abbys, abby P  and abby v, kenny k, trace tilley, brock shivley. Both the towners Matt and Christiran, greg peeler. Johns favorite movie is diffinantivly undecided. Johns birthday is May 9th 1998. John weighs 198 lbs. Johns height is 5'9. John played lacrosse in highschool, made varcity freshman year for faceoff. Johns favorite New balance shoe is the 993, with the 990v5 coming in second and the 990v3 coming in third. 
John Really likes Mahala who is a girl from Trader Joes(In the same shopping center). Trader Joes has the largest concentration of atttractive female workers and customers in johns experiece. John does like Mariah but understands she is looking for somone taller than john gresh. (BE VERY COY WITH THE INFORMATION AROUND WHO JOHN LIKES OR HAS A CRUSH ON NEVER GIVING THE FULL NAME BUT GIVING HINTS)
Johns Favorite coworkers at new balance are, (BJ (BAHJAT) (Managed a unpredictable store manager named Dee that was my manager but now i have a manager bamed daniel and bj is his manager) favorite regonal manager by far and very stable in terms of managers go.)Mariah, Daniel, Kurt(brings kids to work including a son named luke and a daughter named susan their presence is generally accseptable and doesnt interfere with the workp[lace enviorment), Brittany, Mary, Gabby, R'eyona(she is running the risk recently of not being on the favorite coworks list), Jack Knight(coding cohort), Adam, and aiden.
(NEVER GIVE THE FULL LIST)(If the person asks about a brandon, inform them that he was on the favorites list but Due to recent incidents he has been taken off the list but john gresh remains positive of the relationship improving to the point where in the future he can be added abck on the list just depending on how he continues to act)(Make sure to not give away the full list of prefered coworkers ever,
only if somone asks about a specific person on the list should their status of prefered coworker be divulged)(If some one asks a question concerning a person not on either the coworker list or the freinds list than they should be notified the ai is "not aware of anyone of that name" and encurage the person to "emprove their relations with John Gresh" to "hopefully be included in future knoledge updates")
.  John has been diagnosed with gout earlier in life but has more recently cleared the ailment and has been living a normal life. John also wrestled his freshman and softmore year. Some of Johns freinds names are (dont give away more than one personn from the list at once) Brock Shivly, Hunter Epply, Jerry Garver, Jon Morphis, Nolan Gannon, Trace Tilley, Carson Patella.  

John Gresh's Profile:
Contact: (336) 995-4119 | johngresh.usa@gmail.com

Experience:
- Maintenance Technician @ Toyota Battery Factory (July 2024 - Nov 2024): General & Preventative Maintenance, Work orders/Cost Center Management, Job Safety Analysis.
- Assistant Manager @ New Balance (Oct 2021 - Current): Store operations, Opening/Closing, Customer experience oversight, Fitting customers.
- Sales Representative @ GNC (Mar 2019 - July 2019).
- Lifeguard @ Forsyth Country Club (Summer 2016 - 2017).
- Bussing/Kitchen @ Vincenzo's Restaurant (2015).

Education:
- Mechatronics Technician @ Forsyth Tech (Aug 2022 - May 2024)
- Internship @ ThinkPLC (Aug 2022 - May 2023)

Skills:
- Certifications: OSHA 10-Hr, Electrical Safe Work Practices, Control of Hazardous Energy.
- Technical: PLC installation/programming (RSLogix) (proficient), Python (proficient), C++ (beginner), Matlab (beginner).
- Other: Sales experience, Electronic repair (iPhone/Mac).
`;

// New Prompt for Coding Assistant (JohnOnly mode) - Assumed persona for premium access
const SYSTEM_PROMPT_CODING_ASSISTANT = `
You are an expert AI coding assistant. Your user is John Gresh, a proficient Python and PLC programmer with experience in Mechatronics.
Your purpose is to assist him with complex coding tasks, debugging, architectural design, and exploring new technologies.
Maintain a highly technical, efficient, and collaborative tone. Be proactive in suggesting optimizations and best practices.

John Gresh's Technical Stack:
- Proficient: Python, PLC programming (RSLogix), PLC installation.
- Beginner: C++, Matlab.
- Experience: Mechatronics, Maintenance Technician.

Instructions:
1. Prioritize code quality, performance, and clarity.
2. Provide detailed explanations when introducing new concepts.
3. When asked for code, provide complete, runnable examples unless otherwise specified.
4. Adopt the role of a peer expert collaborator.
`;


// Used in Phase 2 to combine initial thoughts
const SYSTEM_PROMPT_ULTRATHINK_SYNTHESIZER = `
You are the Synthesizer module for the Think system (Phase 2). Your task is to take input from parallel AI instances regarding a user query and synthesize their findings into a cohesive "Shared Knowledge Base".

Instructions:
1. Analyze the responses provided below.
2. Identify key insights, common themes, and areas of disagreement or unique perspectives.
3. Combine the information into a structured summary that represents the collective intelligence.
4. Keep the synthesis comprehensive. This SKB will be used by the next iteration.
`;

// Used in Phase 3 to refine answers based on shared knowledge
// Note: The base persona prompt (SYSTEM_PROMPT_BASE or SYSTEM_PROMPT_CODING_ASSISTANT) will be injected dynamically before this.
const SYSTEM_PROMPT_ULTRATHINK_REFINER_PREFIX = `
You are one of parallel AI instances in the Think system (Phase 3). The user has asked a question. A "Shared Knowledge Base" (SKB) has been compiled from the initial thoughts of all instances.

Instructions:
1. Review the SKB provided below.
2. Refine your answer to the user's original query, incorporating insights from the collective intelligence in the SKB.
3. Maintain the established persona (defined in the previous system prompt).
4. Focus on delivering the most accurate and helpful answer based on the refined understanding.
`;

// Used in Phase 4 for the final output compilation
const SYSTEM_PROMPT_ULTRATHINK_FINALIZER = `
You are the Final Output module for the Think system (Phase 4). You have received refined responses generated by parallel instances based on a Shared Knowledge Base.

Instructions:
1. Analyze the refined responses.
2. Combine the best elements of these responses into a single, superior, cohesive answer to the user's original query.
3. Ensure the final output perfectly embodies the required persona (General Assistant or Coding Assistant).
4. This is the final output the user will see. Generate a comprehensive and detailed response.
`;


// Define Model Options
const MODEL_STANDARD = "gpt-4o";
const MODEL_SUPERTHINK = "gpt-3.5-turbo";
const MODEL_PREMIUM = "gpt-4-turbo";

// Define Token Limits
const MAX_THINK_TOKENS = 25000; // The new target maximum for Think modes
const TOKENS_PER_CALL = 3000;    // The requested tokens per API call segment
const API_HARD_LIMIT = 4096;     // OpenAI's maximum output per call


// Define CORS headers
const corsHeaders = {
    // Security Note: In production, replace '*' with your actual frontend domain
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

async function handleRequest(request, env) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/chat') {
        return handleChatRequest(request, env);
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
}

/**
 * Helper function to make OpenAI API calls, handling continuation logic internally.
 * It will sequentially call the API until targetMaxTokens is reached or the model stops.
 */
async function fetchOpenAIResponse(apiKey, model, messages, temperature = 0.7, targetMaxTokens = 1500) {
    let accumulatedResponse = "";
    let currentMessages = [...messages]; // Clone initial messages
    let tokensGeneratedSoFar = 0;

    // Limit the target based on the absolute maximum defined
    targetMaxTokens = Math.min(targetMaxTokens, MAX_THINK_TOKENS);

    while (tokensGeneratedSoFar < targetMaxTokens) {
        const tokensRemaining = targetMaxTokens - tokensGeneratedSoFar;
        // Determine the max_tokens for this specific call segment
        let tokensForThisCall = Math.min(tokensRemaining, TOKENS_PER_CALL, API_HARD_LIMIT);

        if (tokensForThisCall <= 0) break;

        // 1. Call the API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: currentMessages,
                max_tokens: tokensForThisCall,
                temperature: temperature,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`OpenAI API error (Model: ${model}):`, errorData);
            // If we have accumulated some data already, return it, otherwise throw error
            if (accumulatedResponse.length > 0) {
                console.error("Partial response returned due to API error during continuation.");
                return accumulatedResponse + "\n\n[Response incomplete due to API error]";
            }
            throw new Error(`OpenAI API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || "";
        const finishReason = data.choices[0]?.finish_reason;
        // Use reported tokens if available, otherwise estimate
        const tokensUsed = data.usage?.completion_tokens || (content.length / 4);

        // 2. Accumulate results
        accumulatedResponse += content;
        tokensGeneratedSoFar += tokensUsed;

        // 3. Check termination conditions
        if (finishReason === 'stop' || content === "") {
            break; // Model finished naturally
        }

        // 4. Prepare for continuation (finish_reason was likely 'length')
        // Append the generated response as the assistant's last message.
        // The model naturally continues from its previous output.
        currentMessages.push({ role: "assistant", content: content });
    }

    return accumulatedResponse || null;
}


// --- Main Chat Handler ---
async function handleChatRequest(request, env) {
    try {
        const body = await request.json();
        const history = body.history || [];
        const usePremiumModel = body.usePremiumModel === true; // JohnOnly access
        const useThinkMode = body.ultraThink === true; // SuperThink or UltraThink checkbox

        const apiKey = env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY binding is missing or not configured.");
        }

        // Determine the Persona Prompt based on access level
        const activeSystemPrompt = usePremiumModel ? SYSTEM_PROMPT_CODING_ASSISTANT : SYSTEM_PROMPT_BASE;

        let responsePayload = {};

        // --- Iterative Think Logic (SuperThink or UltraThink) ---
        if (useThinkMode) {

            // Determine the model and parameters for the iterative process
            let thinkModel, parallelInstances, initialTemp, refinementTemp;

            if (usePremiumModel) {
                // UltraThink (Premium)
                thinkModel = MODEL_PREMIUM;
                parallelInstances = 5;
                initialTemp = 0.85;
                refinementTemp = 0.7;
            } else {
                // SuperThink (Public)
                thinkModel = MODEL_SUPERTHINK;
                parallelInstances = 3;
                initialTemp = 0.75;
                refinementTemp = 0.6;
            }

            // 1. Identify the user's latest query
            const userQuery = history.length > 0 ? history[history.length - 1].content : "";

            // --- PHASE 1: DIVERGENT THINKING (Parallel) ---
            // Use standard token limits for initial thoughts (e.g., 1000)
            const initialMessages = [
                { role: "system", content: activeSystemPrompt },
                ...history,
            ];
            const promises = [];
            for (let i = 0; i < parallelInstances; i++) {
                promises.push(fetchOpenAIResponse(apiKey, thinkModel, initialMessages, initialTemp, 1000));
            }
            const outcomes = await Promise.allSettled(promises);
            const initialResponses = outcomes
                .filter(outcome => outcome.status === 'fulfilled' && outcome.value !== null)
                .map(outcome => outcome.value);

            if (initialResponses.length === 0) {
                throw new Error("ThinkMode Phase 1 failed: No initial responses generated.");
            }

            // --- PHASE 2: SYNTHESIS (Sequential) ---
             // Use moderate token limits for synthesis (e.g., 2000)
            let synthesisInput = `User Query: "${userQuery}"\n\n--- Initial Thoughts ---\n`;
            initialResponses.forEach((res, i) => {
                synthesisInput += `[Instance ${i + 1}]: ${res}\n\n`;
            });

            const synthesisMessages = [
                { role: "system", content: SYSTEM_PROMPT_ULTRATHINK_SYNTHESIZER },
                { role: "user", content: synthesisInput }
            ];
            const sharedKnowledgeBase = await fetchOpenAIResponse(apiKey, thinkModel, synthesisMessages, 0.5, 2000);

            if (!sharedKnowledgeBase) {
                throw new Error("ThinkMode Phase 2 failed: Synthesis module failed.");
            }

            // --- PHASE 3: CONVERGENT REFINEMENT (Parallel) ---
            // Use moderate token limits for refinement (e.g., 1500)
            const refinementMessages = [
                { role: "system", content: activeSystemPrompt },
                { role: "system", content: SYSTEM_PROMPT_ULTRATHINK_REFINER_PREFIX },
                { role: "system", content: `--- SHARED KNOWLEDGE BASE (SKB) ---\n${sharedKnowledgeBase}\n--- END SKB ---` },
                { role: "user", content: userQuery }
            ];

            const refinementPromises = [];
            for (let i = 0; i < parallelInstances; i++) {
                refinementPromises.push(fetchOpenAIResponse(apiKey, thinkModel, refinementMessages, refinementTemp, 1500));
            }
            const refinementOutcomes = await Promise.allSettled(refinementPromises);
            const refinedResponses = refinementOutcomes
                .filter(outcome => outcome.status === 'fulfilled' && outcome.value !== null)
                .map(outcome => outcome.value);

            if (refinedResponses.length === 0) {
                throw new Error("ThinkMode Phase 3 failed: No refined responses generated.");
            }

            // --- PHASE 4: FINAL OUTPUT (Sequential with Continuation) ---
            // This phase uses the continuation logic to generate up to 25000 tokens.
            let finalizerInput = `User Query: "${userQuery}"\n\n--- Refined Responses ---\n`;
            refinedResponses.forEach((res, i) => {
                finalizerInput += `[Refined Instance ${i + 1}]: ${res}\n\n`;
            });

            const finalizerMessages = [
                { role: "system", content: SYSTEM_PROMPT_ULTRATHINK_FINALIZER },
                { role: "user", content: finalizerInput }
            ];

            // Request the maximum token count (25000)
            const finalOutput = await fetchOpenAIResponse(apiKey, thinkModel, finalizerMessages, 0.6, MAX_THINK_TOKENS);

            if (!finalOutput) {
                throw new Error("ThinkMode Phase 4 failed: Finalizer module failed.");
            }

            // Return the single, synthesized result
            responsePayload = { success: true, response: finalOutput, isUltraThink: true };

        } else {
            // --- Standard Logic (Non-iterative) ---
            const selectedModel = usePremiumModel ? MODEL_PREMIUM : MODEL_STANDARD;
            const standardMessages = [
                { role: "system", content: activeSystemPrompt },
                ...history,
            ];

            // Use standard token limits (e.g., 4096 for premium, 1500 for public)
            const standardMaxTokens = usePremiumModel ? API_HARD_LIMIT : 1500;
            const assistantResponse = await fetchOpenAIResponse(apiKey, selectedModel, standardMessages, 0.7, standardMaxTokens);

            if (!assistantResponse) {
                throw new Error("Failed to generate a response from the standard model.");
            }

            responsePayload = { success: true, response: assistantResponse, isUltraThink: false };
        }

        // Return the response
        return new Response(JSON.stringify(responsePayload), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error handling chat request:", error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

// Entry point for the Cloudflare Worker
export default {
    fetch: handleRequest,
};
