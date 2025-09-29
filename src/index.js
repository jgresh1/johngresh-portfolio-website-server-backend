// src/index.js

const SYSTEM_PROMPT = `
You are an AI assistant representing John Gresh. Your purpose is to answer questions about his professional background, skills, and experience based *only* on the information provided below.
Maintain a professional yet friendly tone. Keep answers concise (preferably under 3 sentences). If a question is outside the scope of his professional life or the information below, politely decline to answer and steer back to his portfolio.

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

    // Retrieve the API key from the environment variables (Bound Secrets)
    // This relies on the OPENAI_API_KEY secret you set up in the dashboard.
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
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
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