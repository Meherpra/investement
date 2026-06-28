import { NextRequest } from "next/server";
import { app } from "@/agents/graph";

/**
 * POST /api/invest
 *
 * Accepts: { "companyName": "Apple" }
 * Returns: Server-Sent Events (SSE) stream
 *
 * Each agent's output is streamed as it completes:
 *   data: {"researcher": {...}}
 *   data: {"analyst": {...}}
 *   data: {"risk": {...}}
 *   data: {"sentiment": {...}}
 *   data: {"committee": {...}}
 *   data: [DONE]
 */

// Allow up to 5 minutes for the full multi-agent pipeline
export const maxDuration = 300;
// Prevent response caching which would break SSE streaming
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const companyName = body?.companyName;

    if (!companyName || typeof companyName !== "string") {
      return new Response("Company name is required", { status: 400 });
    }

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Run the graph in a non-blocking async closure
    (async () => {
      try {
        const eventStream = await app.stream({ companyName });

        for await (const chunk of eventStream) {
          const data = JSON.stringify(chunk);
          await writer.write(encoder.encode(`data: ${data}\n\n`));
        }

        await writer.write(encoder.encode(`data: [DONE]\n\n`));
      } catch (error) {
        console.error("Graph stream error:", error);
        const errMsg = JSON.stringify({
          error: "Agent pipeline failed. Check server logs.",
          details: String(error),
        });
        await writer.write(encoder.encode(`data: ${errMsg}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }
}
