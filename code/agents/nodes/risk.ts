import { AgentState } from "../state";
import { ChatGroq } from "@langchain/groq";

/**
 * Agent 3 — Risk Assessor
 *
 * Identifies specific regulatory, operational, market, and financial
 * risks with severity ratings. Flags deal-breakers.
 */
export async function riskAgent(
  state: AgentState
): Promise<Partial<AgentState>> {
  console.log("[RISK] Assessing risks for:", state.companyName);

  if (!process.env.GROQ_API_KEY) {
    return {
      riskAssessment: "ERROR: GROQ_API_KEY is not set. Add it to .env.local",
    };
  }

  const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.15,
    apiKey: process.env.GROQ_API_KEY,
    maxRetries: 3,
  });

  const prompt = `You are a Chief Risk Officer at an institutional investment fund.

Based on the research data and SWOT analysis for ${state.companyName}, produce a concise risk assessment.

For each risk category below, identify max 2 risks with one line each. Rate severity as LOW / MEDIUM / HIGH / CRITICAL.

1. **Regulatory & Legal Risks**
2. **Market & Competitive Risks**
3. **Operational Risks**
4. **Financial Risks**
5. **Macro Risks**

End with a **Risk Summary**: Overall risk level (LOW / MEDIUM / HIGH) and any DEAL-BREAKERS in 1-2 sentences.

RESEARCH DATA:
${state.researchData}

SWOT ANALYSIS:
${state.swotAnalysis}

Write in professional markdown. Be concise. Max 250 words total.`;

  try {
    const response = await llm.invoke(prompt);
    return { riskAssessment: response.content as string };
  } catch (error) {
    console.error("[RISK ASSESSOR] Failed:", error);
    return {
      riskAssessment: `Failed to generate risk assessment. Error: ${error}`,
    };
  }
}
