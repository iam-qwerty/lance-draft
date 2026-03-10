import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get proposals for an account, optionally filtered by status.
 */
export const getByAccount = query({
  args: {
    upworkAccountId: v.id("upworkAccounts"),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("queued"),
        v.literal("sent"),
        v.literal("skipped"),
        v.literal("discarded"),
        v.literal("failed")
      )
    ),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("proposals")
      .withIndex("by_account", (q) =>
        q.eq("upworkAccountId", args.upworkAccountId)
      );

    if (args.status) {
      q = q.filter((q2) => q2.eq(q2.field("status"), args.status));
    }

    return await q.order("desc").collect();
  },
});

/**
 * Check if a proposal already exists for an (account, job) pair.
 * Prevents reprocessing.
 */
export const existsForJob = query({
  args: {
    upworkAccountId: v.id("upworkAccounts"),
    jobId: v.id("jobsCache"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("proposals")
      .withIndex("by_account_and_job", (q) =>
        q
          .eq("upworkAccountId", args.upworkAccountId)
          .eq("jobId", args.jobId)
      )
      .first();

    return existing !== null;
  },
});

/**
 * Create a new proposal (draft or skipped).
 */
export const create = mutation({
  args: {
    upworkAccountId: v.id("upworkAccounts"),
    jobId: v.id("jobsCache"),
    content: v.string(),
    aiRelevanceScore: v.number(),
    status: v.union(v.literal("draft"), v.literal("skipped")),
  },
  handler: async (ctx, args) => {
    // Double-check: don't create duplicate proposals
    const existing = await ctx.db
      .query("proposals")
      .withIndex("by_account_and_job", (q) =>
        q
          .eq("upworkAccountId", args.upworkAccountId)
          .eq("jobId", args.jobId)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("proposals", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/**
 * Update proposal status (discard, queue, etc.).
 */
export const updateStatus = mutation({
  args: {
    proposalId: v.id("proposals"),
    status: v.union(
      v.literal("draft"),
      v.literal("queued"),
      v.literal("sent"),
      v.literal("discarded"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = { status: args.status };

    if (args.status === "sent") {
      patch.sentAt = Date.now();
    }

    await ctx.db.patch(args.proposalId, patch);
  },
});

/**
 * Update the proposal content (user edits or regeneration).
 */
export const updateContent = mutation({
  args: {
    proposalId: v.id("proposals"),
    content: v.string(),
    isUserEdit: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.isUserEdit) {
      await ctx.db.patch(args.proposalId, {
        userEditedContent: args.content,
      });
    } else {
      // Regeneration replaces original content
      await ctx.db.patch(args.proposalId, {
        content: args.content,
        userEditedContent: undefined,
      });
    }
  },
});

/**
 * Get a single proposal by ID (with job details).
 */
export const getById = query({
  args: { proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) return null;

    const job = await ctx.db.get(proposal.jobId);
    return { proposal, job };
  },
});
