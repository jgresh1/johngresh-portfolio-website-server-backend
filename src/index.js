// src/index.js

const SYSTEM_PROMPT = `
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

// Define Model Options
// Upgraded standard model to gpt-4o
const MODEL_STANDARD = "gpt-4o";
// Using gpt-4-turbo as the placeholder for the superior "gpt-5" model
const MODEL_PREMIUM = "gpt-4-turbo";


// Define CORS headers
const corsHeaders = {
  // Security Note: In production, replace '*' with your actual frontend domain
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function handleRequest(request, env) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);

  // Route the request to the chat handler
  if (request.method === 'POST' && url.pathname === '/chat') {
    return handleChatRequest(request, env);
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });
}

async function handleChatRequest(request, env) {
  try {
    const body = await request.json();
    const history = body.history || [];

    // Check the flag sent from the frontend
    const usePremiumModel = body.usePremiumModel === true;

    // Determine which model to use
    const selectedModel = usePremiumModel ? MODEL_PREMIUM : MODEL_STANDARD;

    // Retrieve the API key from the environment variables (Bound Secrets)
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY binding is missing or not configured.");
    }

    // Construct the messages array for the OpenAI API
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
    ];

    // Call the OpenAI Chat Completions API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Use the selected model
        model: selectedModel,
        messages: messages,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      // Log which model caused the error
      console.error(`OpenAI API error (Model: ${selectedModel}):`, errorData);
      throw new Error(`OpenAI API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

    // Return the successful response to the frontend
    return new Response(JSON.stringify({ success: true, response: assistantResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error handling chat request:", error);
    // Return the error response to the frontend
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Entry point for the Cloudflare Worker (ES Modules syntax)
export default {
  fetch: handleRequest,
};
