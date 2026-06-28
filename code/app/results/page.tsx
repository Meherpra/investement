"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import OrbitalLoader from "../components/OrbitalLoader";
import ResultsDashboard from "../components/ResultsDashboard";
import ChatSidebar from "../components/ChatSidebar";
import { AgentState } from "../types";
import { AgentStep } from "../components/AgentCardGrid";
import { ArrowLeft } from "lucide-react";

type AppState = "loading" | "complete" | "error";

// ─── Ticker map ───────────────────────────────────────────────────────────────

const TICKER_MAP: Record<string, string | null> = {
  apple: "AAPL", aapl: "AAPL",
  tesla: "TSLA", tsla: "TSLA",
  microsoft: "MSFT", msft: "MSFT",
  google: "GOOGL", alphabet: "GOOGL", googl: "GOOGL",
  amazon: "AMZN", amzn: "AMZN",
  meta: "META", facebook: "META",
  netflix: "NFLX", nflx: "NFLX",
  nvidia: "NVDA", nvda: "NVDA",
  openai: null, stripe: null, spacex: null,
};

interface StockPoint { date: string; price: number; }

async function fetchStockData(companyName: string): Promise<StockPoint[]> {
  try {
    const res = await fetch(`/api/stock?company=${encodeURIComponent(companyName)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.points || [];
  } catch {
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ResultsContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const company      = searchParams.get("company") ?? "";

  const [appState,    setAppState]    = useState<AppState>("loading");
  const [agentState,  setAgentState]  = useState<Partial<AgentState>>({ companyName: company });
  const [currentStep, setCurrentStep] = useState<AgentStep>("researcher");
  const [errorMsg,    setErrorMsg]    = useState("");
  const [stockData,   setStockData]   = useState<StockPoint[]>([]);

  // Fade-in
  useEffect(() => {
    document.body.style.opacity = "0";
    const t = setTimeout(() => {
      document.body.style.transition = "opacity 0.4s ease";
      document.body.style.opacity = "1";
    }, 50);
    return () => { clearTimeout(t); document.body.style.opacity = "1"; document.body.style.transition = ""; };
  }, []);

  // Kick off stock fetch immediately (non-blocking)
  useEffect(() => {
    if (!company) return;
    fetchStockData(company).then(setStockData);
  }, [company]);

  // Run analysis once
  const didFetch = useRef(false);
  useEffect(() => {
    if (!company || didFetch.current) return;
    didFetch.current = true;
    runAnalysis(company);
  }, [company]);



  async function runAnalysis(query: string) {
    try {
      const response = await fetch("/api/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: query }),
      });
      if (!response.body) throw new Error("No response body");

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false, buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";
          for (const line of parts) {
            if (!line.startsWith("data: ")) continue;
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") {
              setCurrentStep("done");
              setAppState("complete");
              break;
            }
            try {
              const parsed     = JSON.parse(dataStr);
              const nodeName   = Object.keys(parsed)[0];
              const stateUpd   = parsed[nodeName];
              setAgentState((prev) => ({ ...prev, ...stateUpd }));
              if (nodeName === "researcher") setCurrentStep("analyst");
              else if (nodeName === "analyst")  setCurrentStep("risk");
              else if (nodeName === "risk")      setCurrentStep("sentiment");
              else if (nodeName === "sentiment") setCurrentStep("committee");
            } catch (e) { console.error("SSE parse:", e); }
          }
        }
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setErrorMsg(String(err));
      setAppState("error");
    }
  }

  const isInvest = agentState.finalVerdict === "INVEST";

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)" }}>

      {/* ── Sticky top bar ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={() => router.push("/")}
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "9999px", color: "#fff", padding: "6px 16px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", transition: "all 0.2s ease" }}
          onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)"; }}
          onMouseOut={(e)  => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; }}
        >
          <ArrowLeft size={14} /> New Search
        </button>

        <div style={{ flex: 1, fontSize: "0.87rem", fontWeight: 600, color: "var(--text-secondary)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
          {appState === "loading" ? (
            <><span style={{ color: "var(--text-muted)" }}>Researching</span>{" "}<span style={{ color: "var(--text-primary)" }}>{company}</span><span style={{ color: "var(--text-muted)" }}> — agents running...</span></>
          ) : appState === "complete" ? (
            <><span style={{ color: "var(--text-muted)" }}>Analysis complete —</span>{" "}<span style={{ color: "var(--text-primary)" }}>{company}</span></>
          ) : null}
        </div>

        {appState === "complete" && agentState.finalVerdict && (
          <span style={{ background: isInvest ? "rgba(16,185,129,0.15)" : "rgba(155,107,243,0.15)", border: `1px solid ${isInvest ? "rgba(16,185,129,0.4)" : "rgba(155,107,243,0.4)"}`, color: isInvest ? "#10b981" : "#c4a7ff", borderRadius: "9999px", padding: "4px 14px", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.05em", flexShrink: 0 }}>
            {agentState.finalVerdict} · {agentState.convictionScore}/100
          </span>
        )}
      </div>

      {/* ── OrbitalLoader — always visible ── */}
      {appState !== "error" && (
        <OrbitalLoader
          currentStep={appState === "complete" ? "done" : currentStep}
          companyName={company}
          finalVerdict={agentState.finalVerdict as "INVEST" | "PASS" | undefined}
          convictionScore={agentState.convictionScore}
        />
      )}

      {/* ── Error ── */}
      {appState === "error" && (
        <div style={{ padding: "80px 20px", textAlign: "center" }}>
          <p style={{ color: "#ef4444", fontSize: "1.05rem", marginBottom: "20px" }}>Analysis failed: {errorMsg}</p>
          <button className="btn-generate" onClick={() => router.push("/")}>Back to Home</button>
        </div>
      )}

      {/* ── Results ── */}
      {appState === "complete" && (
        <div>
          <ResultsDashboard
            state={agentState}
            onNewSearch={() => router.push("/")}
            stockData={stockData}
          />
          <ChatSidebar companyName={company} />
        </div>
      )}
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg-base)" }} />}>
      <ResultsContent />
    </Suspense>
  );
}
