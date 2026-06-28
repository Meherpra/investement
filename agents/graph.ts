import { StateGraph, START, END } from "@langchain/langgraph";
import { GraphState } from "./state";
import { researcherAgent } from "./nodes/researcher";
import { analystAgent } from "./nodes/analyst";
import { riskAgent } from "./nodes/risk";
import { sentimentAgent } from "./nodes/sentiment";
import { committeeAgent } from "./nodes/committee";

/**
 * LangGraph Workflow — 5-Agent Optimized Pipeline
 *
 * OLD (fully sequential, ~35-45s):
 *   START → Researcher → Analyst → Risk → Sentiment → Committee → END
 *
 * NEW (parallel fan-out, ~15-20s):
 *   START → Researcher ─┬→ Analyst → Risk ─┬→ Committee → END
 *                       └→ Sentiment ───────┘
 *
 * Key insight:
 *   - Analyst only needs researchData  → can start right after Researcher
 *   - Sentiment only needs researchData → can ALSO start right after Researcher (parallel!)
 *   - Risk needs swotAnalysis           → must wait for Analyst
 *   - Committee needs all three         → LangGraph fan-in: waits for both Risk AND Sentiment
 */
const workflow = new StateGraph(GraphState)
  .addNode("researcher", researcherAgent)
  .addNode("analyst", analystAgent)
  .addNode("sentiment", sentimentAgent) // runs parallel to analyst
  .addNode("risk", riskAgent)
  .addNode("committee", committeeAgent)

  // Researcher kicks off
  .addEdge(START, "researcher")

  // Fan-out: both analyst and sentiment start immediately after researcher
  .addEdge("researcher", "analyst")
  .addEdge("researcher", "sentiment")

  // Risk depends on analyst (needs swotAnalysis)
  .addEdge("analyst", "risk")

  // Fan-in: committee waits for BOTH risk AND sentiment to complete
  .addEdge("risk", "committee")
  .addEdge("sentiment", "committee")

  .addEdge("committee", END);

export const app = workflow.compile();
