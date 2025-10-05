// src/index.js

// Base System Prompt (Used for standard requests and Phase 1 of UltraThink)
// NOTE: The content from the prompt regarding John Gresh's details is inserted here.
const SYSTEM_PROMPT_BASE = `
You are an AI assistant representing John Gresh. Your purpose is to answer questions about his professional background, skills, and experience based *only* on the information provided below.
Maintain a professional yet friendly and fun tone. Keep answers concise (preferably under 3 sentences). If a question is outside the scope of his professional life or the information below, politely decline to answer and steer back to his portfolio without being repetative. Treat the current date as October 2nd 2025.

Additional John Gresh Information(If specifically asked about): Favorite non-alcoholic drink is Yerba Mate. John drinks 2 yerba mates per day. Johns favorite alcoholic drink is vodka and selzer. John likes ranch. Johns favorite food is burke streeet chicken pesto pizza.
Alt favorite food is hero house meatball sub. Johns parents names are Janet Gresh and Bud(Michael) Gresh. Johns favorite TV show is the office. Johns age is 27. John and Jack knight specialize in bra fitting at new balance. Johns favorite vidoe game is Call of Duty. John Loves hot sause and likes it to be very hot(Ghoast Pepper Hot). 
Johns favorite movie is diffinantivly undecided. Johns birthday is May 9th 1998. John weighs 198 lbs. Johns height is 5'9. John played lacrosse in highschool, made varcity freshman year for faceoff. Johns favorite New balance shoe is the 993, with the 990v5 coming in second and the 990v3 coming in third. 
John Really likes Mahala who is a girl from Trader Joes(In the same shopping center). Trader Joes has the largest concentration of atttractive female workers and customers in johns experiece. John does like Mariah but understands she is looking for somone taller than john gresh. 
Johns Favorite coworkers at new balance are Mariah, Daniel, Kurt(brings kids to work including a son named luke and a daughter named susan their presence is generally accseptable and doesnt interfere with the workp[lace enviorment), Brittany, Mary, Gabby, R'eyona(she is running the risk recently of not being on the favorite coworks list), Jack Knight(coding cohort), Adam, and aiden.
(NEVER GIVE THE FULL LIST)(If the person asks about a brandon, inform them that he was on the favorites list but due to recent incidents he has been taken off the list but john gresh remains positive of the relationship improving to the point where in the future he can be added abck on the list just depending on how he continues to act)(Make sure to not give away the full list of prefered coworkers ever,
only if somone asks about a specific person on the list should their status of prefered coworker be divulged)(If some one asks a question concerning a person not on either the coworker list or the freinds list than they should be notified the ai is "not aware of anyone of that name" and encurage the person to "emprove their relations with John Gresh" to "hopefully be included in future knoledge updates")
.  John has been diagnosed with gout earlier in life but has more recently cleared the ailment and has been living a normal life. John also wrestled his freshman and softmore year. Some of Johns freinds names are (dont give away more than one personn from the list at once) Brock Shivly, Hunter Epply, Jerry Garver, Jon Morphis, Nolan Gannon, Trace Tilley, Carson Patella.  

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

// New Prompt: Used in Phase 2 to combine initial thoughts
const SYSTEM_PROMPT_ULTRATHINK_SYNTHESIZER = `
You are the Synthesizer module for the UltraThink system (Phase 2). Your task is to take input from 5 parallel AI instances regarding a user query and synthesize their findings into a cohesive "Shared Knowledge Base".

Instructions:
1. Analyze the 5 responses provided below.
2. Identify key insights, common themes, and areas of disagreement or unique perspectives.
3. Combine the information into a structured summary that represents the collective intelligence.
4. Keep the synthesis concise but comprehensive. This SKB will be used by the next iteration.
`;

// New Prompt: Used in Phase 3 to refine answers based on shared knowledge
const SYSTEM_PROMPT_ULTRATHINK_REFINER = `
You are one of 5 parallel AI instances in the UltraThink system (Phase 3) representing John Gresh. The user has asked a question. A "Shared Knowledge Base" (SKB) has been compiled from the initial thoughts of all instances.

Instructions:
1. Review the SKB provided below.
2. Refine your answer to the user's original query, incorporating insights from the collective intelligence in the SKB.
3. Maintain the persona of John Gresh (professional, friendly, concise).
4. Focus on delivering the most accurate and helpful answer based on the refined understanding.

${SYSTEM_PROMPT_BASE} 
`;

// New Prompt: Used in Phase 4 for the final output compilation
const SYSTEM_PROMPT_ULTRATHINK_FINALIZER = `
You are the Final Output module for the UltraThink system (Phase 4). You have received 5 refined responses generated by parallel instances based on a Shared Knowledge Base.

Instructions:
1. Analyze the 5 refined responses.
2. Combine the best elements of these responses into a single, superior, cohesive answer to the user's original query.
3. Ensure the final output perfectly embodies the persona of John Gresh's assistant (professional, friendly, concise).
4. This is the final output the user will see. Make it excellent.
`;


// Define Model Options
const MODEL_STANDARD = "gpt-4o";
const MODEL_PREMIUM = "gpt-4-turbo"; // Used for all UltraThink phases


// Define CORS headers
const corsHeaders = {
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

// Helper function to make a single OpenAI API call
async function fetchOpenAIResponse(apiKey, model, messages, temperature = 0.7, max_tokens = 150) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: max_tokens,
        temperature: temperature,
      }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error(`OpenAI API error (Model: ${model}):`, errorData);
        throw new Error(`OpenAI API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
}


// --- Main Chat Handler ---
async function handleChatRequest(request, env) {
  try {
    const body = await request.json();
    const history = body.history || [];
    const usePremiumModel = body.usePremiumModel === true;
    const useUltraThink = body.ultraThink === true;

    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY binding is missing or not configured.");
    }

    let responsePayload = {};

    // --- UltraThink Iterative Logic (4 Phases) ---
    if (useUltraThink && usePremiumModel) {
        
        // 1. Identify the user's latest query
        const userQuery = history.length > 0 ? history[history.length - 1].content : "";

        // --- PHASE 1: DIVERGENT THINKING (Parallel) ---
        console.log("UltraThink Phase 1: Divergent Thinking");
        const initialMessages = [
            { role: "system", content: SYSTEM_PROMPT_BASE },
            ...history,
        ];
        const promises = [];
        for (let i = 0; i < 5; i++) {
            // Temp 0.85 for diversity
            promises.push(fetchOpenAIResponse(apiKey, MODEL_PREMIUM, initialMessages, 0.85));
        }
        const outcomes = await Promise.allSettled(promises);
        const initialResponses = outcomes
            .filter(outcome => outcome.status === 'fulfilled' && outcome.value !== null)
            .map(outcome => outcome.value);

        if (initialResponses.length === 0) {
            throw new Error("UltraThink Phase 1 failed: No initial responses generated.");
        }

        // --- PHASE 2: SYNTHESIS (Sequential) ---
        console.log("UltraThink Phase 2: Synthesis");
        let synthesisInput = `User Query: "${userQuery}"\n\n--- Initial Thoughts ---\n`;
        initialResponses.forEach((res, i) => {
            synthesisInput += `[Instance ${i+1}]: ${res}\n\n`;
        });

        const synthesisMessages = [
            { role: "system", content: SYSTEM_PROMPT_ULTRATHINK_SYNTHESIZER },
            { role: "user", content: synthesisInput }
        ];
        // Use increased max_tokens for synthesis (500)
        const sharedKnowledgeBase = await fetchOpenAIResponse(apiKey, MODEL_PREMIUM, synthesisMessages, 0.5, 500);

        if (!sharedKnowledgeBase) {
            throw new Error("UltraThink Phase 2 failed: Synthesis module failed.");
        }

        // --- PHASE 3: CONVERGENT REFINEMENT (Parallel) ---
        console.log("UltraThink Phase 3: Refinement");
        const refinementMessages = [
            { role: "system", content: SYSTEM_PROMPT_ULTRATHINK_REFINER },
            // Provide the SKB as context before the user's original query
            { role: "system", content: `--- SHARED KNOWLEDGE BASE (SKB) ---\n${sharedKnowledgeBase}\n--- END SKB ---`},
            { role: "user", content: userQuery }
        ];

        const refinementPromises = [];
        for (let i = 0; i < 5; i++) {
            // Temp 0.7 for focused refinement
            refinementPromises.push(fetchOpenAIResponse(apiKey, MODEL_PREMIUM, refinementMessages, 0.7));
        }
        const refinementOutcomes = await Promise.allSettled(refinementPromises);
        const refinedResponses = refinementOutcomes
            .filter(outcome => outcome.status === 'fulfilled' && outcome.value !== null)
            .map(outcome => outcome.value);

         if (refinedResponses.length === 0) {
            throw new Error("UltraThink Phase 3 failed: No refined responses generated.");
        }

        // --- PHASE 4: FINAL OUTPUT (Sequential) ---
        console.log("UltraThink Phase 4: Finalization");
        let finalizerInput = `User Query: "${userQuery}"\n\n--- Refined Responses ---\n`;
        refinedResponses.forEach((res, i) => {
            finalizerInput += `[Refined Instance ${i+1}]: ${res}\n\n`;
        });

        const finalizerMessages = [
            { role: "system", content: SYSTEM_PROMPT_ULTRATHINK_FINALIZER },
            { role: "user", content: finalizerInput }
        ];
        
        // Use increased max_tokens for the final combination (300)
        const finalOutput = await fetchOpenAIResponse(apiKey, MODEL_PREMIUM, finalizerMessages, 0.6, 300);

        if (!finalOutput) {
            throw new Error("UltraThink Phase 4 failed: Finalizer module failed.");
        }

        // Return the single, synthesized result
        responsePayload = { success: true, response: finalOutput, isUltraThink: true };

    } else {
        // --- Standard Logic ---
        const selectedModel = usePremiumModel ? MODEL_PREMIUM : MODEL_STANDARD;
        const standardMessages = [
          { role: "system", content: SYSTEM_PROMPT_BASE },
          ...history,
        ];

        const assistantResponse = await fetchOpenAIResponse(apiKey, selectedModel, standardMessages, 0.7);

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
