/**
 * Client-side type definitions for the agent state.
 *
 * IMPORTANT: Do NOT import from `../agents/state` in client components.
 * That file uses @langchain/langgraph Annotations which pull the entire
 * LangGraph dependency tree into the browser bundle, causing 8+ second
 * first-paint delays. Use this lightweight mirror instead.
 */

export interface AgentState {
  companyName: string;
  researchData: string;
  swotAnalysis: string;
  riskAssessment: string;
  sentimentAnalysis: string;
  convictionScore: number;
  finalVerdict: "INVEST" | "PASS" | "PENDING";
  investmentThesis: string;
}
