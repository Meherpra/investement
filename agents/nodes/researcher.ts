import { AgentState } from "../state";
import { getCompanyStockData } from "../../app/utils/stock";

/**
 * Agent 1 — Researcher
 *
 * Uses Serper.dev (Google Search API) to gather real-time web data:
 * business model, financial news, competitors, risks, and market trends.
 *
 * Also utilizes a Stock Tool (Alpha Vantage / Yahoo Finance) to ingest
 * daily market trends and price indicators for the target asset.
 */

const SERPER_URL = "https://google.serper.dev/search";

async function serperSearch(query: string, apiKey: string): Promise<string> {
  const res = await fetch(SERPER_URL, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num: 8 }),
  });

  if (!res.ok) {
    throw new Error(`Serper API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  let output = "";

  // Answer box (direct answer if available)
  if (data.answerBox?.answer) {
    output += `Quick Answer: ${data.answerBox.answer}\n\n`;
  }
  if (data.answerBox?.snippet) {
    output += `Summary: ${data.answerBox.snippet}\n\n`;
  }

  // Knowledge graph (company info)
  if (data.knowledgeGraph) {
    const kg = data.knowledgeGraph;
    output += `Company: ${kg.title ?? ""} — ${kg.description ?? ""}\n`;
    if (kg.attributes) {
      for (const [k, v] of Object.entries(kg.attributes)) {
        output += `  ${k}: ${v}\n`;
      }
    }
    output += "\n";
  }

  // Organic results
  if (data.organic?.length) {
    output += "--- Search Results ---\n";
    for (const r of data.organic.slice(0, 6)) {
      output += `\nSource: ${r.link}\nTitle: ${r.title}\n${r.snippet ?? ""}\n`;
    }
  }

  return output.trim();
}

export async function researcherAgent(
  state: AgentState
): Promise<Partial<AgentState>> {
  console.log("[RESEARCHER] Gathering data for:", state.companyName);

  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    return {
      researchData:
        "ERROR: SERPER_API_KEY is not set in .env.local. Get a free key at https://serper.dev",
    };
  }

  try {
    // Ingest business data, financial news, and stock pricing metrics in parallel
    const [businessData, financialData, stockResult] = await Promise.all([
      serperSearch(
        `${state.companyName} company business model products competitors market 2025`,
        apiKey
      ),
      serperSearch(
        `${state.companyName} financial results revenue earnings risks outlook 2025`,
        apiKey
      ),
      getCompanyStockData(state.companyName),
    ]);

    const report = [
      `=== RESEARCH REPORT: ${state.companyName} ===`,
      "",
      "--- BUSINESS & COMPETITIVE LANDSCAPE ---",
      businessData,
      "",
      "--- FINANCIAL PERFORMANCE & RISKS ---",
      financialData,
      "",
      "--- MARKET TRANSACTION DATA & PRICE TRENDS ---",
      stockResult.summary,
    ].join("\n");

    return { researchData: report };
  } catch (error) {
    console.error("[RESEARCHER] Search failed:", error);
    return {
      researchData: `Search failed for "${state.companyName}". Error: ${String(error)}`,
    };
  }
}

