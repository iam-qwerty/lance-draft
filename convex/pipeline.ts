/**
 * Pipeline runner — orchestrates the full job polling pipeline.
 * This is a Convex action that runs server-side.
 *
 * Pipeline steps:
 * 1. Load active users (paid, profile complete)
 * 2. Build query set (deduplicate skills across users)
 * 3. Fetch jobs from RSS
 * 4. Cache new jobs (idempotent)
 * 5. For each user: hard filter → AI score → draft proposal
 * 6. Notify users with new drafts
 *
 * Called by the /api/cron/poll-jobs endpoint.
 * Full implementation in Phase 4.
 */

import { action } from "./_generated/server";

export const runPipeline = action({
  args: {},
  handler: async () => {
    console.log("[pipeline] Starting job polling pipeline...");

    // TODO: Phase 4 — Implement full pipeline
    // Step 1: Load active users from Convex
    // Step 2: Build deduped query set from all users' skills
    // Step 3: Fetch RSS for each unique query
    // Step 4: Cache new jobs in jobsCache
    // Step 5: For each user, for each new job:
    //   5a. Check if proposal already exists (dedup)
    //   5b. Apply hard filters
    //   5c. AI relevance scoring (gemini-2.0-flash-lite)
    //   5d. If score >= 6: select best case study + draft proposal
    //   5e. Save proposal as "draft" or "skipped"
    // Step 6: Check if >= 3 new drafts → send notification email

    console.log("[pipeline] Pipeline complete (stub)");

    return { success: true, jobsProcessed: 0, proposalsDrafted: 0 };
  },
});
