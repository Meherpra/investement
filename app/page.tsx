"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import GenieHero from "./components/GenieHero";
import SearchHero from "./components/SearchHero";
import AgentCardGrid from "./components/AgentCardGrid";
import GenieFooter from "./components/GenieFooter";

export default function Page() {
  const searchRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const aboutMeRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToSearch = () => {
    searchRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToCards = () => {
    cardsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToAboutMe = () => {
    aboutMeRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = (query: string) => {
    router.push(`/results?company=${encodeURIComponent(query)}`);
  };

  return (
    <main>
      {/* Top Cinematic Hero Section */}
      <GenieHero 
        onExploreClick={scrollToSearch} 
        onHowItWorksClick={scrollToCards}
        onAgentsClick={scrollToCards}
        onAboutMeClick={scrollToAboutMe}
      />

      {/* Workspace Section — always idle/demo mode */}
      <section ref={searchRef} style={{ minHeight: "80vh", paddingTop: "64px" }}>
        <SearchHero onSearch={handleSearch} isIdle={true} />

        <div ref={cardsRef} style={{ padding: "16px 0 64px 0", display: "flex", justifyContent: "center", scrollMarginTop: "80px" }}>
          {/* AgentCardGrid stays in idle/demo mode on the home page */}
          <AgentCardGrid currentStep={"done" as any} />
        </div>
      </section>

      {/* About Me / Footer Section */}
      <div ref={aboutMeRef} style={{ scrollMarginTop: "80px" }}>
        <GenieFooter />
      </div>
    </main>
  );
}
