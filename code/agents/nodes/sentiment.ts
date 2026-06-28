import { AgentState } from "../state";
import { ChatGroq } from "@langchain/groq";

const FALLBACK_MODEL = "gemma2-9b-it";

/**
 * Agent 4 — Sentiment Analyst
 *
 * Analyzes market and news sentiment to determine whether the
 * overall narrative around the company is bullish or bearish.
 */
export async function sentimentAgent(
  state: AgentState
): Promise<Partial<AgentState>> {
  console.log("[SENTIMENT] Gauging sentiment for:", state.companyName);

  // 2s stagger: analyst fires immediately, sentiment fires 2s later
  // Prevents both parallel branches from hitting the same model at the exact same ms
  await new Promise((res) => setTimeout(res, 2000));

  if (!process.env.GROQ_API_KEY) {
    return {
      sentimentAnalysis:
        "ERROR: GROQ_API_KEY is not set. Add it to .env.local",
    };
  }

  const prompt = `You are a quantitative sentiment analyst.

Based on the research data for ${state.companyName}, analyze market and news sentiment concisely:

1. **News Sentiment** — 2-3 lines. Tone of recent articles (bullish / bearish / neutral).
2. **Market Narrative** — 2-3 lines. What story is the market telling right now?
3. **Analyst / Investor Sentiment** — 2-3 lines. Notable positions or upgrades/downgrades.

Conclude with one line: **Overall Sentiment Score**: STRONGLY BULLISH / BULLISH / NEUTRAL / BEARISH / STRONGLY BEARISH and a brief justification.

RESEARCH DATA:
${state.researchData}

Be concise. Max 150 words total.`;

  let response;
  try {
    const llm = new ChatGroq({
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      apiKey: process.env.GROQ_API_KEY,
      maxRetries: 2,
    });
    response = await llm.invoke(prompt);
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    if (errMsg.includes("429") || errMsg.includes("rate_limit")) {
      console.warn("[SENTIMENT] Rate limited on mixtral, falling back to", FALLBACK_MODEL);
      const fallback = new ChatGroq({
        model: FALLBACK_MODEL,
        temperature: 0.3,
        apiKey: process.env.GROQ_API_KEY,
        maxRetries: 3,
      });
      response = await fallback.invoke(prompt);
    } else {
      console.error("[SENTIMENT] Failed:", e);
      return {
        sentimentAnalysis: `Failed to generate sentiment analysis. Error: ${e}`,
      };
    }
  }

  return { sentimentAnalysis: response.content as string };
}
