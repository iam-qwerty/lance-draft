import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get filter rules for an Upwork account.
 */
export const getByAccount = query({
  args: { upworkAccountId: v.id("upworkAccounts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("filterRules")
      .withIndex("by_account", (q) =>
        q.eq("upworkAccountId", args.upworkAccountId)
      )
      .first();
  },
});

/**
 * Create or update filter rules.
 * maxProposalsPerDay is capped at 15 (hard limit per spec).
 */
export const upsert = mutation({
  args: {
    upworkAccountId: v.id("upworkAccounts"),
    minBudget: v.number(),
    jobTypes: v.array(v.string()),
    requiredKeywords: v.array(v.string()),
    excludedKeywords: v.array(v.string()),
    requirePaymentVerified: v.boolean(),
    minClientRating: v.number(),
    maxProposalsPerDay: v.number(),
  },
  handler: async (ctx, args) => {
    // Enforce hard cap of 15 proposals per day
    const cappedMaxPerDay = Math.min(Math.max(args.maxProposalsPerDay, 1), 15);

    const existing = await ctx.db
      .query("filterRules")
      .withIndex("by_account", (q) =>
        q.eq("upworkAccountId", args.upworkAccountId)
      )
      .first();

    const filterData = {
      upworkAccountId: args.upworkAccountId,
      minBudget: args.minBudget,
      jobTypes: args.jobTypes,
      requiredKeywords: args.requiredKeywords,
      excludedKeywords: args.excludedKeywords,
      requirePaymentVerified: args.requirePaymentVerified,
      minClientRating: args.minClientRating,
      maxProposalsPerDay: cappedMaxPerDay,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, filterData);
      return existing._id;
    }

    return await ctx.db.insert("filterRules", filterData);
  },
});
