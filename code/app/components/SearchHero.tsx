"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

interface SearchHeroProps {
  onSearch: (companyName: string) => void;
  isIdle: boolean;
}

export default function SearchHero({ onSearch, isIdle }: SearchHeroProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 20px 32px 20px",
        textAlign: "center",
      }}
    >
      {isIdle && (
        <h2
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 500,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            marginBottom: "16px",
            color: "var(--text-primary)",
          }}
        >
          Research an asset
        </h2>
      )}

      {isIdle && (
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1.1rem",
            maxWidth: "600px",
            marginBottom: "48px",
            lineHeight: 1.6,
          }}
        >
          Enter any public ticker or company to trigger the multi-agent analysis.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="search-wrapper"
        style={{
          width: "100%",
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        <Search size={20} color="var(--text-muted)" style={{ marginLeft: "8px" }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="NVDA, Tesla, Apple, Stripe..."
          className="search-input"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="btn-glass"
          style={{ fontSize: "0.95rem", padding: "10px 28px" }}
        >
          Generate Verdict
        </button>
      </form>
    </div>
  );
}
