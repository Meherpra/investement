"use client";

import React, { useState, useEffect, useCallback } from "react";

export type AgentStep =
  | "researcher"
  | "analyst"
  | "risk"
  | "sentiment"
  | "committee"
  | "done";

interface AgentCardGridProps {
  currentStep: AgentStep;
}

const AGENTS = [
  {
    id: "researcher",
    number: "01",
    title: "Researcher Agent",
    description:
      "Gathers real-time data from news, filings, and web sources to build a deep understanding of the company and industry.",
    image: "/agent-researcher.jpg",
    step: "researcher" as AgentStep,
  },
  {
    id: "analyst",
    number: "02",
    title: "Financial Analyst",
    description:
      "Analyzes financial statements, key ratios, growth metrics, and valuation to uncover financial strengths and risks.",
    image: "/agent-analyst.jpg",
    step: "analyst" as AgentStep,
  },
  {
    id: "risk",
    number: "03",
    title: "Risk Analyst",
    description:
      "Identifies market, operational, financial, and regulatory risks that could impact future performance.",
    image: "/agent-risk.jpg",
    step: "risk" as AgentStep,
  },
  {
    id: "sentiment",
    number: "04",
    title: "Sentiment Analyst",
    description:
      "Reads news tone, social signals, and analyst consensus to gauge how the market narrative is shaping perception.",
    image: "/agent-sentiment.jpg",
    step: "sentiment" as AgentStep,
  },
  {
    id: "committee",
    number: "05",
    title: "Investment Committee",
    description:
      "Synthesizes all agent reports to deliver a final INVEST or PASS verdict with a scored conviction rating.",
    image: "/agent-committee.jpg",
    step: "committee" as AgentStep,
  },
];

const stepOrder: AgentStep[] = [
  "researcher",
  "analyst",
  "risk",
  "sentiment",
  "committee",
];

function getCardStatus(
  agentStep: AgentStep,
  currentStep: AgentStep
): "IDLE" | "RUNNING" | "COMPLETED" {
  if (currentStep === "done") return "COMPLETED";
  const currentIdx = stepOrder.indexOf(currentStep);
  const agentIdx = stepOrder.indexOf(agentStep);
  if (agentIdx < currentIdx) return "COMPLETED";
  if (agentIdx === currentIdx) return "RUNNING";
  return "IDLE";
}

// Compute the shortest-path offset from active index, with wrapping
function getOffset(cardIndex: number, activeIndex: number, total: number) {
  let offset = cardIndex - activeIndex;
  if (offset > Math.floor(total / 2)) offset -= total;
  if (offset < -Math.floor(total / 2)) offset += total;
  return offset;
}

export default function AgentCardGrid({ currentStep }: AgentCardGridProps) {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkResize = () => setIsMobile(window.innerWidth < 640);
    checkResize();
    window.addEventListener("resize", checkResize);
    return () => window.removeEventListener("resize", checkResize);
  }, []);

  const prev = useCallback(
    () => setActiveIndex((i) => (i - 1 + AGENTS.length) % AGENTS.length),
    []
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i + 1) % AGENTS.length),
    []
  );

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        userSelect: "none",
      }}
    >
      {/* ─── Carousel Track ─── */}
      <div
        style={{
          position: "relative",
          height: isMobile ? "380px" : "460px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Cards — all 5 rendered, positioned via transform */}
        {AGENTS.map((agent, i) => {
          const offset = getOffset(i, activeIndex, AGENTS.length);
          const isFeatured = offset === 0;
          const isAdjacent = Math.abs(offset) === 1;
          const isHidden = Math.abs(offset) >= 2;
          const status = getCardStatus(agent.step, currentStep);

          // Card geometry
          const width = isFeatured 
            ? (isMobile ? 285 : 380) 
            : isAdjacent 
            ? (isMobile ? 220 : 300) 
            : 260;
          const height = isFeatured 
            ? (isMobile ? 360 : 440) 
            : (isMobile ? 280 : 360);
          const translateX = offset * (isMobile ? 245 : 340); // gap between card centres
          const scale = isFeatured ? 1 : isAdjacent ? 0.88 : 0.75;
          const opacity = isFeatured ? 1 : isAdjacent ? 0.55 : 0;
          const zIndex = isFeatured ? 10 : isAdjacent ? 5 : 1;
          const blur = isFeatured ? 0 : isAdjacent ? 0 : 8;

          return (
            <div
              key={agent.id}
              onClick={() => {
                if (offset === -1) prev();
                if (offset === 1) next();
              }}
              style={{
                position: "absolute",
                width: `${width}px`,
                height: `${height}px`,
                borderRadius: "26px",
                overflow: "hidden",
                cursor: isAdjacent ? "pointer" : isFeatured ? "default" : "default",
                transition: "all 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: `translateX(${translateX}px) scale(${scale})`,
                opacity: isHidden ? 0 : opacity,
                zIndex,
                pointerEvents: isHidden ? "none" : "auto",
                background: "rgba(22, 22, 28, 0.98)",
                boxShadow: isFeatured
                  ? "0 35px 75px -12px rgba(0,0,0,0.85), inset 3px 3px 8px rgba(255,255,255,0.03), inset 1px 1px 0px rgba(255,255,255,0.04), inset -6px -6px 14px rgba(0,0,0,0.65)"
                  : "0 20px 40px -10px rgba(0,0,0,0.75), inset 2px 2px 6px rgba(255,255,255,0.02), inset 0.8px 0.8px 0px rgba(255,255,255,0.03), inset -5px -5px 10px rgba(0,0,0,0.55)",
                filter: blur > 0 ? `blur(${blur}px)` : "none",
                display: "flex",
                flexDirection: "column",
                padding: isFeatured ? "24px" : "16px",
                boxSizing: "border-box",
              }}
            >
              {/* ── Debossed Image Slot (Concave Clay) ── */}
              <div
                style={{
                  width: "100%",
                  height: isFeatured ? (isMobile ? "150px" : "190px") : (isMobile ? "110px" : "140px"),
                  borderRadius: "16px",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "inset 3px 3px 6px rgba(0,0,0,0.82), inset -1.5px -1.5px 4px rgba(255,255,255,0.015)",
                  marginBottom: isFeatured ? "18px" : "12px",
                  flexShrink: 0,
                  background: "rgba(10,10,12,0.8)"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url('${agent.image}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: isFeatured ? "scale(1.04)" : "scale(1)",
                  }}
                />
                
                {/* Number badge inside image frame for skeuomorphic detail */}
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.8)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {agent.number}
                </div>
              </div>

              {/* Title & Description Info */}
              <div 
                key={`content-${agent.id}-${isFeatured}`}
                style={{ 
                  flex: 1, 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "flex-start",
                  animation: isFeatured ? "contentSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.05s both" : "none"
                }}
              >
                <h3
                  style={{
                    fontSize: isFeatured ? (isMobile ? "1.2rem" : "1.45rem") : (isMobile ? "0.95rem" : "1.1rem"),
                    fontWeight: 800,
                    color: "#fff",
                    marginBottom: isFeatured ? "10px" : "0",
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                    transition: "font-size 0.4s ease",
                  }}
                >
                  {agent.title}
                </h3>

                {isFeatured && (
                  <p
                    style={{
                      fontSize: isMobile ? "0.78rem" : "0.85rem",
                      color: "rgba(255,255,255,0.7)",
                      lineHeight: 1.6,
                      margin: 0,
                      marginBottom: "12px",
                      animation: "contentSlideUp 0.65s cubic-bezier(0.4,0,0.2,1) 0.12s both",
                    }}
                  >
                    {agent.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* ─── Left Arrow ─── */}
        <button
          onClick={prev}
          aria-label="Previous agent"
          style={{
            position: "absolute",
            left: 0,
            zIndex: 20,
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#fff",
            fontSize: "1.6rem",
            lineHeight: 1,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.25s ease",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.16)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
            e.currentTarget.style.transform = "scale(1.08)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          ‹
        </button>

        {/* ─── Right Arrow ─── */}
        <button
          onClick={next}
          aria-label="Next agent"
          style={{
            position: "absolute",
            right: 0,
            zIndex: 20,
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#fff",
            fontSize: "1.6rem",
            lineHeight: 1,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.25s ease",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.16)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
            e.currentTarget.style.transform = "scale(1.08)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          ›
        </button>
      </div>

      {/* ─── Dot Indicators ─── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginTop: "20px",
        }}
      >
        {AGENTS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-label={`Go to agent ${i + 1}`}
            style={{
              width: i === activeIndex ? "28px" : "8px",
              height: "8px",
              borderRadius: "9999px",
              background:
                i === activeIndex
                  ? "rgba(255,255,255,0.92)"
                  : "rgba(255,255,255,0.22)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        ))}
      </div>

      {/* ─── Keyframe Definitions ─── */}
      <style>{`
        @keyframes gradientRise {
          from {
            clip-path: inset(70% 0 0 0);
            opacity: 0;
          }
          to {
            clip-path: inset(0% 0 0 0);
            opacity: 1;
          }
        }

        @keyframes contentSlideUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulseBg {
          from { opacity: 0.5; }
          to   { opacity: 1; }
        }

        @keyframes pulseWhite {
          0%   { box-shadow: 0 0 0 0 rgba(155, 107, 243, 0.6); }
          70%  { box-shadow: 0 0 0 5px rgba(155, 107, 243, 0); }
          100% { box-shadow: 0 0 0 0 rgba(155, 107, 243, 0); }
        }
      `}</style>
    </div>
  );
}
