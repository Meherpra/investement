import { Annotation } from "@langchain/langgraph";

/**
 * GraphState — the shared "clipboard" passed between all 5 agents.
 *
 * LangGraph's Annotation.Root ensures that when an agent returns a partial
 * update, it merges cleanly with the existing state instead of overwriting.
 *
 * Flow: Researcher → Analyst → Risk Assessor → Sentiment Analyst → Committee
 */
export const GraphState = Annotation.Root({
  // ── Input ──
  companyName: Annotation<string>({
    reducer: (_current, incoming) => incoming ?? _current,
    default: () => "",
  }),

  // ── Agent 1: Researcher ──
  researchData: Annotation<string>({
    reducer: (_current, incoming) => incoming ?? _current,
    default: () => "",
  }),

  // ── Agent 2: Financial Analyst ──
  swotAnalysis: Annotation<string>({
    reducer: (_current, incoming) => incoming ?? _current,
    default: () => "",
  }),

  // ── Agent 3: Risk Assessor ──
  riskAssessment: Annotation<string>({
    reducer: (_current, incoming) => incoming ?? _current,
    default: () => "",
  }),

  // ── Agent 4: Sentiment Analyst ──
  sentimentAnalysis: Annotation<string>({
    reducer: (_current, incoming) => incoming ?? _current,
    default: () => "",
  }),

  // ── Agent 5: Investment Committee ──
  convictionScore: Annotation<number>({
    reducer: (_current, incoming) => incoming ?? _current,
    default: () => 0,
  }),
  finalVerdict: Annotation<"INVEST" | "PASS" | "PENDING">({
    reducer: (_current, incoming) => incoming ?? _current,
    default: () => "PENDING",
  }),
  investmentThesis: Annotation<string>({
    reducer: (_current, incoming) => incoming ?? _current,
    default: () => "",
  }),
});

export type AgentState = typeof GraphState.State;
