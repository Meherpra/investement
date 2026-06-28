import { AgentState } from "../state";
import { ChatGroq } from "@langchain/groq";

const FALLBACK_MODEL = "gemma2-9b-it";

/**
 * Agent 5 — Investment Committee
 *
 * The final decision-maker. Synthesizes ALL previous agents' outputs
 * and produces a structured verdict:
 * - verdict: INVEST or PASS
 * - convictionScore: 0-100
 * - thesis: concise investment thesis (max 2 paragraphs)
 *
 * NOTE: We use a manual JSON parse approach instead of withStructuredOutput
 * because withStructuredOutput has compatibility issues with Zod v4 and
 * certain model configurations. This is more reliable.
 */
export async function committeeAgent(
  state: AgentState
): Promise<Partial<AgentState>> {
  console.log("[COMMITTEE] Finalizing verdict for:", state.companyName);

  if (!process.env.GROQ_API_KEY) {
    return {
      convictionScore: 0,
      finalVerdict: "PASS",
      investmentThesis: "ERROR: GROQ_API_KEY is not set.",
    };
  }

  const prompt = `You are the Head of the Investment Committee at a premier venture/growth equity fund.

You are reviewing all analysis on ${state.companyName} from your team. Make the FINAL call: INVEST or PASS.

Consider:
- Strength of competitive moat and revenue model
- Severity and manageability of identified risks
- Market sentiment and narrative momentum
- Overall risk/reward profile

SWOT ANALYSIS:
${state.swotAnalysis}

RISK ASSESSMENT:
${state.riskAssessment}

SENTIMENT ANALYSIS:
${state.sentimentAnalysis}

Be decisive. A score above 70 typically means INVEST. Below 50 typically means PASS. Between 50-70 is a close call.

You MUST respond with ONLY a valid JSON object in this exact format (no markdown, no extra text):
{
  "verdict": "INVEST" or "PASS",
  "convictionScore": <integer 0-100>,
  "thesis": "<max 2 paragraphs justifying the verdict. Keep the thesis concise, max 150 words.>"
}`;

  let response;
  try {
    const llm = new ChatGroq({
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      apiKey: process.env.GROQ_API_KEY,
      maxRetries: 2,
    });
    response = await llm.invoke(prompt);
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    if (errMsg.includes("429") || errMsg.includes("rate_limit")) {
      console.warn("[COMMITTEE] Rate limited on mixtral, falling back to", FALLBACK_MODEL);
      const fallback = new ChatGroq({
        model: FALLBACK_MODEL,
        temperature: 0.1,
        apiKey: process.env.GROQ_API_KEY,
        maxRetries: 3,
      });
      response = await fallback.invoke(prompt);
    } else {
      console.error("[COMMITTEE] Failed:", e);
      return {
        convictionScore: 0,
        finalVerdict: "PASS",
        investmentThesis: `Failed to generate verdict. Error: ${e}`,
      };
    }
  }

  const content = response.content as string;

  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  const jsonMatch =
    content.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1]?.trim() ??
    content.trim();

  let parsed: {
    verdict: "INVEST" | "PASS";
    convictionScore: number;
    thesis: string;
  };

  try {
    parsed = JSON.parse(jsonMatch);
  } catch {
    // Last-ditch attempt: find the first { ... } block
    const objectMatch = content.match(/\{[\s\S]*\}/)?.[0];
    if (!objectMatch) {
      return {
        convictionScore: 0,
        finalVerdict: "PASS",
        investmentThesis: `Failed to parse verdict JSON. Raw: ${content.slice(0, 300)}`,
      };
    }
    parsed = JSON.parse(objectMatch);
  }

  // Validate and sanitize
  const verdict = parsed.verdict === "INVEST" ? "INVEST" : "PASS";
  const convictionScore = Math.max(
    0,
    Math.min(100, Math.round(Number(parsed.convictionScore) || 0))
  );
  const thesis =
    typeof parsed.thesis === "string" ? parsed.thesis : "No thesis provided.";

  return {
    convictionScore,
    finalVerdict: verdict,
    investmentThesis: thesis,
  };
}
