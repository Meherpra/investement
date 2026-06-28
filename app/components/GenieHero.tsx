"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, MoreVertical } from "lucide-react";

interface GenieHeroProps {
  onExploreClick: () => void;
  onHowItWorksClick?: () => void;
  onAgentsClick?: () => void;
  onAboutMeClick?: () => void;
}

export default function GenieHero({ 
  onExploreClick,
  onHowItWorksClick,
  onAgentsClick,
  onAboutMeClick
}: GenieHeroProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkResize = () => setIsMobile(window.innerWidth < 640);
    checkResize();
    window.addEventListener("resize", checkResize);
    return () => window.removeEventListener("resize", checkResize);
  }, []);

  return (
    <section 
      style={{
        position: "relative",
        width: "100%",
        // 111.11vh ensures that exactly 90% of the image (100vh) is visible on initial load.
        height: "111.11vh",
        backgroundImage: "url('/hero-bg-clean.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      {/* Top Header Navigation matching Image 1 with fading glassmorphism */}
      <header style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        padding: isMobile ? "16px 20px" : "32px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 20,
        // Fading glassmorphism effect
        background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        // This mask makes the blur itself fade out smoothly towards the bottom
        maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
      }}>
        <div style={{ width: isMobile ? "0px" : "100px", display: isMobile ? "none" : "block", paddingLeft: "16px" }}></div> {/* Placeholder for balance */}
        
        <nav style={{
          display: "flex",
          gap: isMobile ? "18px" : "48px",
          color: "rgba(255,255,255,0.8)",
          fontSize: isMobile ? "0.85rem" : "1.05rem",
          fontWeight: 500
        }}>
          <span style={{ color: "#fff", cursor: "pointer" }} onClick={onHowItWorksClick}>How It Works</span>
          <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'} onClick={onAgentsClick}>Agents</span>
          <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'} onClick={onAboutMeClick}>About Me</span>
        </nav>
        
        <div style={{ display: "flex", gap: isMobile ? "12px" : "24px", color: "#fff", paddingRight: isMobile ? "0px" : "16px" }}>
          <MessageSquare size={isMobile ? 20 : 24} style={{ cursor: "pointer" }} />
          <MoreVertical size={isMobile ? 20 : 24} style={{ cursor: "pointer" }} />
        </div>
      </header>

      {/* Main Hero Content */}
      <div style={{ 
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        zIndex: 10,
        paddingBottom: "10vh" // offset slightly to align perfectly with the background sphere
      }}>
        
        <h1 style={{
          fontSize: "clamp(3.5rem, 8vw, 7rem)",
          fontWeight: 600,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          marginBottom: "24px",
          color: "#ffffff"
        }}>
          Investment Genie
        </h1>
        
        <p style={{
          fontSize: "clamp(1.2rem, 3vw, 2rem)",
          color: "rgba(255, 255, 255, 0.9)",
          fontWeight: 400,
          letterSpacing: "-0.01em",
          marginBottom: "48px"
        }}>
          Multi-agent analysis. Smarter research. Confident decisions.
        </p>

        {/* The new Glassmorphism "Try it" button */}
        <button 
          onClick={onExploreClick} 
          className="btn-glass"
          style={{ marginBottom: "32px", fontSize: "1.1rem", padding: "14px 40px" }}
        >
          Try now
        </button>
      </div>

      {/* A subtle gradient at the bottom to smoothly blend the image into the true black background of our workspace */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "25vh",
        background: "linear-gradient(to bottom, transparent, var(--bg-base))",
        pointerEvents: "none"
      }}></div>
    </section>
  );
}
