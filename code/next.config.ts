import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@langchain/core",
    "@langchain/langgraph",
    "@langchain/groq",
    "langchain",
  ],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
