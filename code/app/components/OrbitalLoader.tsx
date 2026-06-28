"use client";

import React, { useState, useEffect } from "react";
import { Search, TrendingUp, ShieldAlert, MessageSquare, Heart } from "lucide-react";
import { AgentStep } from "./AgentCardGrid";

interface OrbitalLoaderProps {
  agentState: any;
  appState: string;
  companyName: string;
}

// Fallback defaults for sizing
const NODE_R  = 46;   // agent node radius (92px diameter)
const ORB_R   = 70;   // center orb radius (140px diameter)
const CTR_H   = 540;  // enlarged container height (540px)
const ORBIT_R = 215;  // enlarged circular path radius (215px) for more separation

const AGENT_DEFS = [
  { id: "researcher", name: "Researcher", step: "researcher" as AgentStep, angle: -90, no: "01" },
  { id: "analyst",    name: "Analyst",    step: "analyst" as AgentStep,    angle: -18, no: "02" },
  { id: "risk",       name: "Risk Agent", step: "risk" as AgentStep,       angle: 54,  no: "03" },
  { id: "sentiment",  name: "Sentiment",  step: "sentiment" as AgentStep,  angle: 126, no: "04" },
  { id: "committee",  name: "Committee",  step: "committee" as AgentStep,  angle: 198, no: "05" },
];

const ICONS: Record<string, React.ReactNode> = {
  researcher: <Search size={18} />,
  analyst:    <TrendingUp size={18} />,
  risk:       <ShieldAlert size={18} />,
  sentiment:  <MessageSquare size={18} />,
  committee:  <Heart size={18} />,
};

const SUBTITLES: Record<string, string> = {
  researcher: "Data Sweep",
  analyst:    "SWOT Analysis",
  risk:       "Risk Profile",
  sentiment:  "Market Tone",
  committee:  "Verdict",
};

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function getStatus(step: AgentStep, agentState: any, appState: string): "IDLE" | "RUNNING" | "COMPLETE" {
  if (appState === "complete") return "COMPLETE";
  if (appState === "error") return "IDLE";

  if (step === "researcher") {
    if (agentState.researchData) return "COMPLETE";
    return "RUNNING";
  }
  if (step === "analyst") {
    if (agentState.swotAnalysis) return "COMPLETE";
    if (agentState.researchData) return "RUNNING";
    return "IDLE";
  }
  if (step === "sentiment") {
    if (agentState.sentimentAnalysis) return "COMPLETE";
    if (agentState.researchData) return "RUNNING";
    return "IDLE";
  }
  if (step === "risk") {
    if (agentState.riskAssessment) return "COMPLETE";
    if (agentState.swotAnalysis) return "RUNNING";
    return "IDLE";
  }
  if (step === "committee") {
    if (agentState.finalVerdict && agentState.finalVerdict !== "PENDING") return "COMPLETE";
    if (agentState.riskAssessment && agentState.sentimentAnalysis) return "RUNNING";
    return "IDLE";
  }
  return "IDLE";
}

// Draw smooth Bezier curves to the center orb
function buildPath(id: string, sx: number, sy: number, ex: number, ey: number, R: number): string {
  return `M ${sx} ${sy} C ${(sx + ex) / 2} ${(sy + ey) / 2}, ${(sx + ex) / 2} ${(sy + ey) / 2}, ${ex} ${ey}`;
}

export default function OrbitalLoader({
  agentState, appState, companyName,
}: OrbitalLoaderProps) {
  const [w, setW] = useState(1200);

  const statuses       = AGENT_DEFS.map((a) => getStatus(a.step, agentState, appState));
  const completedCount = statuses.filter((s) => s === "COMPLETE").length;
  const allComplete    = completedCount === 5;
  const finalVerdict   = agentState.finalVerdict;
  const convictionScore = agentState.convictionScore;
  const isInvest       = finalVerdict === "INVEST";
  const verdictColor   = isInvest ? "#10b981" : "#9b6bf3";

  // ── Measure container width dynamically ──────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const measure = () => {
      const container = document.getElementById("orbital-container");
      if (container) {
        setW(container.clientWidth);
      } else {
        setW(window.innerWidth);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // ── Computed positions (Dynamic Responsiveness) ──────────────────────────
  const isMobile = w < 640;
  const nodeR = isMobile ? 30 : NODE_R;
  const orbR = isMobile ? 46 : ORB_R;
  const ctrH = isMobile ? 360 : CTR_H;
  const orbitR = isMobile ? 115 : ORBIT_R;

  const cx = w * 0.5;
  const cy = ctrH * 0.5;

  const agentPos = AGENT_DEFS.map((a) => {
    const rad = toRad(a.angle);
    return {
      x: cx + orbitR * Math.cos(rad),
      y: cy + orbitR * Math.sin(rad),
    };
  });

  // ── Path d-strings ─────────────────────────────────────────────────────
  const paths = AGENT_DEFS.map((a, i) =>
    buildPath(a.id, agentPos[i].x, agentPos[i].y, cx, cy, orbitR)
  );

  return (
    <div style={{ width: "100%", paddingBottom: "12px" }}>
      <style>{`
        @keyframes orbReveal {
          0%   { transform: translate(-50%, -50%) scale(1); }
          40%  { transform: translate(-50%, -50%) scale(1.08); }
          70%  { transform: translate(-50%, -50%) scale(0.97); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes verdictIn {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes orbRotate {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.55; }
        }
        @keyframes drawRunning {
          0% {
            stroke-dashoffset: 100;
          }
          10% {
            /* Quick shoot-out: covers 35% of the path in the first ~1.2 seconds */
            stroke-dashoffset: 65;
          }
          100% {
            /* Slow crawl: crawls to 85% of the path over the remaining 11 seconds */
            stroke-dashoffset: 15;
          }
        }
        .agent-orb-node:hover {
          transform: translate(-50%, -50%) scale(1.08) !important;
          border-color: rgba(255,255,255,0.7) !important;
          box-shadow: 0 0 20px rgba(255,255,255,0.15) !important;
          background: rgba(15,15,15,0.9) !important;
        }
        .center-orb-inner {
          position: relative;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.25) !important;
          border: 1px solid rgba(255, 255, 255, 0.25) !important;
          backdrop-filter: blur(24px) !important;
          -webkit-backdrop-filter: blur(24px) !important;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.4) !important;
          transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
          cursor: pointer;
        }
        .center-orb-inner::before {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.75) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-25deg);
          transition: left 0.65s cubic-bezier(0.25, 1, 0.5, 1);
          pointer-events: none;
        }
        .center-orb-inner:hover {
          transform: scale(1.06) !important;
          background: radial-gradient(circle at 40% 30%, rgba(30, 30, 42, 0.4) 0%, rgba(10, 10, 15, 0.65) 60%, rgba(5, 5, 8, 0.85) 100%), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.07'/%3E%3C/svg%3E") !important;
          border-color: rgba(255, 255, 255, 0.95) !important;
          box-shadow: 0 0 35px rgba(255, 255, 255, 0.45), inset 0 1px 4px rgba(255, 255, 255, 0.85) !important;
        }
        .center-orb-inner:hover::before {
          left: 200%;
        }
      `}</style>

      {/* ── Main container ── */}
      <div
        id="orbital-container"
        style={{
          position: "relative",
          width: "100%",
          height: `${ctrH}px`,
          overflow: "hidden",
        }}
      >
        {/* ── SVG: bezier paths ── */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}
        >
          <defs>
            {/* Glow — very subtle, not neon */}
            <filter id="pathGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="1.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Mask: punch out circles at nodes and center orb so lines stop at edges */}
            <mask id="lineMask">
              <rect width="100%" height="100%" fill="white" />
              <circle cx={cx} cy={cy} r={orbR + 2} fill="black" />
              {agentPos.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={nodeR + 2} fill="black" />
              ))}
            </mask>
          </defs>

          {AGENT_DEFS.map((a, idx) => {
            const d      = paths[idx];
            const status = statuses[idx];

            const isDone = status === "COMPLETE";
            const lineColor = isDone
              ? "#10b981"
              : "rgba(255,255,255,0.7)";

            const targetOffset = isDone ? 0 : 100;

            const animationValue = isDone
              ? "none"
              : "drawRunning 15s cubic-bezier(0.1, 0.45, 0.15, 1) forwards";

            const transitionStyle = isDone
              ? "stroke-dashoffset 0.75s cubic-bezier(0.25, 1, 0.5, 1), stroke 0.8s ease"
              : "stroke 0.6s ease";

            return (
              <g key={a.id} mask="url(#lineMask)">
                {/* Base faint track — always visible */}
                <path d={d} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" strokeLinecap="round" />

                {/* Drawing path using CSS keyframes / transitions */}
                <path
                  d={d}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  pathLength="100"
                  strokeDasharray="100"
                  strokeDashoffset={targetOffset}
                  filter="url(#pathGlow)"
                  style={{
                    animation: animationValue,
                    transition: transitionStyle,
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* ── Agent nodes ── */}
        {AGENT_DEFS.map((a, idx) => {
          const pos       = agentPos[idx];
          const status    = statuses[idx];
          const isRunning = status === "RUNNING";
          const isDone    = status === "COMPLETE";

          return (
            <div
              key={a.id}
              onClick={() => {
                const element = document.getElementById(a.id);
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className="agent-orb-node"
              style={{
                position: "absolute",
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: "translate(-50%, -50%)",
                width: `${nodeR * 2}px`,
                height: `${nodeR * 2}px`,
                borderRadius: "50%",
                /* Claymorphism style */
                background: isDone
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.45) 0%, rgba(10, 80, 50, 0.75) 100%)"
                  : isRunning
                  ? "linear-gradient(135deg, rgba(94, 155, 255, 0.5) 0%, rgba(30, 60, 120, 0.75) 100%)"
                  : "linear-gradient(135deg, rgba(40, 40, 50, 0.8) 0%, rgba(20, 20, 25, 0.95) 100%)",
                border: "none",
                boxShadow: isDone
                  ? "0 12px 28px rgba(0, 0, 0, 0.75), 0 0 16px rgba(16,185,129,0.35), inset 3px 3px 6px rgba(255,255,255,0.4), inset -3px -3px 8px rgba(0,0,0,0.85)"
                  : isRunning
                  ? "0 12px 28px rgba(0, 0, 0, 0.75), 0 0 16px rgba(94,155,255,0.35), inset 3px 3px 6px rgba(255,255,255,0.45), inset -3px -3px 8px rgba(0,0,0,0.85)"
                  : "0 10px 20px rgba(0, 0, 0, 0.65), inset 3px 3px 6px rgba(255,255,255,0.15), inset -3px -3px 8px rgba(0,0,0,0.85)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex: 5,
                color: isDone ? "#10b981" : "rgba(255,255,255,0.55)",
                padding: "4px",
                boxSizing: "border-box",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: isMobile ? "0.48rem" : "0.6rem", fontWeight: 600, color: "rgba(255,255,255,0.35)", lineHeight: 1 }}>
                {a.no}
              </span>
              <div style={{ opacity: isDone ? 0.9 : 0.55, lineHeight: 1, margin: isMobile ? "1px 0" : "2px 0", transform: isMobile ? "scale(0.85)" : "none" }}>
                {ICONS[a.id]}
              </div>
              <span style={{ fontSize: isMobile ? "0.55rem" : "0.68rem", fontWeight: 600, color: isDone ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)", lineHeight: 1.1 }}>
                {a.name}
              </span>
              <span style={{ fontSize: isMobile ? "0.38rem" : "0.48rem", fontWeight: 600, letterSpacing: "0.05em", color: isDone ? "rgba(16,185,129,0.75)" : isRunning ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.2)", lineHeight: 1, textTransform: "uppercase", marginTop: "1px" }}>
                {SUBTITLES[a.id]}
              </span>
              {isDone && (
                <span style={{ fontSize: isMobile ? "0.55rem" : "0.7rem", color: "#10b981", fontWeight: 700, lineHeight: 1, marginTop: "2px" }}>✓</span>
              )}
            </div>
          );
        })}

        {/* ── Center orb ── */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: `${orbR * 2}px`,
            height: `${orbR * 2}px`,
            borderRadius: "50%",
            zIndex: 10,
            animation: allComplete ? "orbReveal 0.5s ease-out" : "none",
          }}
        >
          {/* Rotating conic border (during processing) */}
          {!allComplete && completedCount > 0 && (
            <div
              style={{
                position: "absolute",
                inset: "-2px",
                borderRadius: "50%",
                background: "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.1) 90deg, transparent 180deg, transparent 360deg)",
                animation: "orbRotate 3s linear infinite",
                zIndex: 0,
              }}
            />
          )}

          {/* Inner circle content */}
          <div
            className="center-orb-inner"
            style={{
              position: "absolute",
              inset: "1px",
              borderRadius: "50%",
              background: allComplete
                ? isInvest 
                  ? `radial-gradient(circle at 35% 30%, rgba(16,185,129,0.3) 0%, rgba(10,80,50,0.85) 45%, rgba(4,4,6,0.99) 90%), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.07'/%3E%3C/svg%3E")`
                  : `radial-gradient(circle at 35% 30%, rgba(155,107,243,0.3) 0%, rgba(80,50,130,0.85) 45%, rgba(4,4,6,0.99) 90%), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.07'/%3E%3C/svg%3E")`
                : `radial-gradient(circle at 35% 30%, #2a2a35 0%, #0e0e15 50%, #030305 95%), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.07'/%3E%3C/svg%3E")`,
              border: "1px solid rgba(0, 0, 0, 0.8)",
              borderTop: "2.5px solid rgba(255, 255, 255, 0.4)",
              borderLeft: "2.5px solid rgba(255, 255, 255, 0.25)",
              borderBottom: "3px solid rgba(0, 0, 0, 0.95)",
              borderRight: "2px solid rgba(0, 0, 0, 0.85)",
              boxShadow: allComplete
                ? `0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px ${isInvest ? "rgba(16,185,129,0.35)" : "rgba(155,107,243,0.35)"}, inset 8px 8px 16px rgba(255,255,255,0.32), inset -10px -10px 20px rgba(0,0,0,0.9)`
                : "0 25px 60px rgba(0, 0, 0, 0.95), inset 8px 8px 16px rgba(255,255,255,0.25), inset -10px -10px 20px rgba(0,0,0,0.9)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              textAlign: "center",
              padding: "12px",
              boxSizing: "border-box",
            }}
          >
            {/* Skeuomorphic Glass Specular Glare Overlay */}
            <div style={{
              position: "absolute",
              top: "4px",
              left: "10px",
              width: "80%",
              height: "40%",
              borderRadius: "50% / 100% 100% 0 0",
              background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 100%)",
              transform: "rotate(-12deg)",
              pointerEvents: "none",
              zIndex: 3
            }} />
            {allComplete ? (
              <div style={{ animation: "verdictIn 0.4s ease-out forwards", width: "100%" }}>
                <div style={{ fontSize: isMobile ? "1.2rem" : "1.75rem", fontWeight: 800, color: verdictColor, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  {finalVerdict}
                </div>
                {convictionScore !== undefined && (
                  <>
                    <div style={{ fontSize: isMobile ? "0.8rem" : "1rem", color: "#ffffff", fontWeight: 700, marginTop: "4px", lineHeight: 1 }}>
                      {convictionScore}/100
                    </div>
                    <div style={{ fontSize: isMobile ? "0.45rem" : "0.55rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 600, marginTop: "4px", textTransform: "uppercase" }}>
                      CONFIDENCE SCORE
                    </div>
                  </>
                )}
              </div>
            ) : completedCount > 0 ? (
              <>
                <span style={{ fontSize: isMobile ? "1rem" : "1.2rem", fontWeight: 600, color: "#fff", lineHeight: 1 }}>
                  {completedCount}/5
                </span>
                <span style={{ fontSize: isMobile ? "0.5rem" : "0.58rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: "4px", animation: "subtlePulse 2.5s ease-in-out infinite" }}>
                  analyzing
                </span>
              </>
            ) : (
              <span style={{ fontSize: isMobile ? "0.6rem" : "0.75rem", color: "rgba(255,255,255,0.35)", maxWidth: isMobile ? "80px" : "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
                {companyName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      {!allComplete && (
        <div style={{ width: "100%", height: "2px", background: "rgba(255,255,255,0.06)" }}>
          <div
            style={{
              height: "100%",
              background: "linear-gradient(to right, rgba(255,255,255,0.4), #10b981)",
              width: `${(completedCount / 5) * 100}%`,
              transition: "width 1s ease",
            }}
          />
        </div>
      )}
    </div>
  );
}
