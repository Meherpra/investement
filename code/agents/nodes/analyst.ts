import { AgentState } from "../state";
import { ChatGroq } from "@langchain/groq";

/**
 * Agent 2 — Financial Analyst
 *
 * Processes the Researcher's raw data and produces a structured
 * SWOT analysis plus competitive moat evaluation.
 */
export async function analystAgent(
  state: AgentState
): Promise<Partial<AgentState>> {
  console.log("[ANALYST] Analyzing data for:", state.companyName);

  if (!process.env.GROQ_API_KEY) {
    return {
      swotAnalysis: "ERROR: GROQ_API_KEY is not set. Add it to .env.local",
    };
  }

  const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    apiKey: process.env.GROQ_API_KEY,
    maxRetries: 3,
  });

  const prompt = `You are a senior financial analyst at a top-tier investment bank.

Based on the following research data about ${state.companyName}, produce a concise analysis:

1. **SWOT Analysis** — Max 3 bullet points per category (Strengths, Weaknesses, Opportunities, Threats). 2 sentences per bullet max.
2. **Competitive Moat Assessment** — 2 sentences only. What sustainable advantage does this company have?
3. **Revenue Model Evaluation** — 2 sentences only. How does the company make money and how resilient is it?

RESEARCH DATA:
${state.researchData}

Write in clean, professional markdown. Be concise. Max 300 words total.`;

  try {
    const response = await llm.invoke(prompt);
    return { swotAnalysis: response.content as string };
  } catch (error) {
    console.error("[ANALYST] Failed:", error);
    return {
      swotAnalysis: `Failed to generate SWOT analysis. Error: ${error}`,
    };
  }
}
