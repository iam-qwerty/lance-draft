import { NextRequest, NextResponse } from "next/server";

/**
 * Cron endpoint for job polling pipeline.
 * Called by Cloudflare Cron Trigger every 15 minutes.
 * Validates CRON_SECRET header before proceeding.
 */
export async function POST(req: NextRequest) {
  // Validate CRON_SECRET — reject 401 if missing or invalid
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken) {
    console.error("Missing CRON_SECRET env var");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // TODO: Phase 4 — Run the full pipeline:
    // 1. Load active users
    // 2. Build query set (deduplicate skill sets)
    // 3. Fetch jobs from RSS
    // 4. Cache new jobs
    // 5. For each user: hard filter → AI score → draft proposal
    // 6. Notify users with new drafts

    console.log("[cron] Job polling pipeline triggered at", new Date().toISOString());

    return NextResponse.json({
      success: true,
      message: "Pipeline executed",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron] Pipeline error:", err);
    return NextResponse.json(
      { error: "Pipeline failed", details: String(err) },
      { status: 500 }
    );
  }
}
