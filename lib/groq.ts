import { ExtractedData } from './types';

const SYSTEM_PROMPT = `You are an expert AI executive secretary and technical project manager.
Your task is to analyze raw meeting transcripts (which may have speaker tags or be messy conversational transcripts) and extract high-value, structured intelligence.

Extract:
1. "title": A concise, descriptive title for the meeting.
2. "summary": A high-impact 2-3 sentence executive summary of the meeting outcomes.
3. "key_topics": Array of 3-5 main topic tags discussed.
4. "decisions": Array of official decisions agreed upon by the team. Each decision must include:
   - "decision_text": Clear statement of what was decided.
   - "category": Category (e.g. Architecture, Product, Security, Pricing, Operations).
   - "rationale": Why this decision was made (based on transcript discussion).
   - "source_quote": Exact or near-exact quote/sentence from transcript confirming the decision.
5. "action_items": Array of concrete assigned tasks. Each action item must include:
   - "task": Clear, actionable task description.
   - "owner_name": The specific person assigned or volunteering for the task (or "Unassigned" if ambiguous).
   - "owner_email": Best effort email address if explicitly stated, otherwise empty string "".
   - "deadline": Estimated or stated due date in ISO 8601 string (e.g. "2026-10-02T18:00:00Z"). If relative, infer a realistic upcoming date.
   - "priority": "High", "Medium", or "Low" based on urgency and importance discussed.
   - "category": Department/area (e.g. Engineering, Backend, Frontend, Sales, Security, Design).
   - "source_quote": The quote from the transcript identifying the task and assignment.

CRITICAL REQUIREMENT:
You MUST respond ONLY with a single valid JSON object strictly adhering to this schema. Do not include markdown ticks (\`\`\`json) outside the JSON.`;

// Primary model as specified by user
const PRIMARY_MODEL = 'qwen/qwen3-32b';

// Ordered fallback candidates — only active, non-decommissioned models
const CANDIDATE_MODELS = [
  'qwen/qwen3-32b',
  'qwen/qwen3.8-27b',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'meta-llama/llama-4-maverick-17b-128e-instruct',
];

export async function extractMeetingInsightsWithGroq(
  transcript: string,
  customApiKey?: string
): Promise<ExtractedData> {
  const apiKey = customApiKey || process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing. Please provide your Groq API key in .env.local or via Connect Tools in the top bar.');
  }

  let lastError: Error | null = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Analyze the following meeting transcript and extract structured decisions, action items with owners and deadlines, summary, and topics:\n\n---\n${transcript}\n---`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
          max_tokens: 4096,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed: ExtractedData = JSON.parse(content);
          return parsed;
        }
      } else {
        const errorText = await response.text();
        console.warn(`Attempt with ${model} returned HTTP ${response.status}:`, errorText);
        let msg = errorText;
        try {
          const errJson = JSON.parse(errorText);
          msg = errJson.error?.message || errorText;
        } catch {}
        lastError = new Error(`Groq API error with ${model}: ${msg}`);
      }
    } catch (err: any) {
      console.warn(`Error connecting to Groq with model ${model}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to analyze transcript with Qwen model.');
}
