"use client";

import React from "react";

export default function GenieFooter() {
  return (
    <footer
      style={{
        marginTop: "120px",
        borderTop: "1px solid var(--border-dim)",
        padding: "64px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Top row — section links */}
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "48px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Built with LangGraph · Gemini · Next.js
        </span>
        <div
          style={{
            display: "flex",
            gap: "24px",
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
          }}
        >
          <span>Researcher Agent</span>
          <span>Financial Analyst</span>
          <span>Risk Assessor</span>
          <span>Sentiment Analyst</span>
          <span>Committee Verdict</span>
        </div>
      </div>

      {/* Big headline */}
      <h2
        style={{
          fontSize: "clamp(3.5rem, 13vw, 11rem)",
          fontWeight: 600,
          letterSpacing: "-0.05em",
          lineHeight: 0.9,
          color: "var(--text-primary)",
          margin: "0 0 64px 0",
          width: "100%",
          textAlign: "center",
        }}
      >
        Investment Genie
      </h2>

      {/* Bottom row — brand + nav */}
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "var(--text-muted)",
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span
          style={{
            color: "var(--text-primary)",
            fontSize: "1rem",
            letterSpacing: "normal",
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Investment Genie
        </span>
        <span>Multi-Agent Research</span>
        <span>How It Works</span>
        <span>Architecture</span>
        <span>Privacy</span>
        <span>
          <a href="mailto:meherpra5@gmail.com" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'inherit'}>
            meherpra5@gmail.com
          </a>
        </span>
        <span>
          <a href="tel:+91-6304276594" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'inherit'}>
            +91-6304276594
          </a>
        </span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
