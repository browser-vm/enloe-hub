import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Approximate costs per 1M tokens (input/output)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  "google/gemini-2.5-flash": { input: 0.075, output: 0.30 },
  "google/gemini-2.5-flash-lite": { input: 0.02, output: 0.08 },
  "openai/gpt-5-mini": { input: 0.15, output: 0.60 },
  "openai/gpt-5-nano": { input: 0.05, output: 0.20 },
  "mistral-small-latest": { input: 0.10, output: 0.30 },
  "mistral-large-latest": { input: 2.00, output: 6.00 },
  "open-mistral-nemo": { input: 0.15, output: 0.15 },
};

const MISTRAL_MODELS = ["mistral-small-latest", "mistral-large-latest", "open-mistral-nemo"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, model = "google/gemini-2.5-flash" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const MISTRAL_API_KEY = Deno.env.get("MISTRAL_API_KEY");
    
    const isMistralModel = MISTRAL_MODELS.includes(model);
    
    if (isMistralModel && !MISTRAL_API_KEY) {
      throw new Error("MISTRAL_API_KEY is not configured");
    }
    if (!isMistralModel && !LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`AI Chat request - Model: ${model}, Messages: ${messages.length}, Provider: ${isMistralModel ? 'Mistral' : 'Lovable AI'}`);

    const systemMessage = { 
      role: "system", 
      content: "You are a helpful AI assistant. Be friendly, concise, and helpful. You can help with general questions, homework, coding, and more. Note: If asked about Enloe High School specifically, let the user know you don't currently have access to web search to look up school-specific information, but that feature is coming soon!" 
    };

    let response;
    if (isMistralModel) {
      // Call Mistral API directly
      response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [systemMessage, ...messages],
        }),
      });
    } else {
      // Call Lovable AI Gateway
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [systemMessage, ...messages],
        }),
      });
    }

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    
    // Calculate cost
    const modelCosts = MODEL_COSTS[model] || { input: 0.1, output: 0.3 };
    const inputCost = (usage.prompt_tokens / 1_000_000) * modelCosts.input;
    const outputCost = (usage.completion_tokens / 1_000_000) * modelCosts.output;
    const totalCost = inputCost + outputCost;

    console.log(`Response - Tokens: ${usage.total_tokens}, Cost: $${totalCost.toFixed(6)}`);

    return new Response(JSON.stringify({ 
      content,
      usage: {
        ...usage,
        cost: totalCost,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
