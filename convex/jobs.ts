import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Insert a job into the cache (idempotent on upworkJobId).
 * Returns the existing job ID if already cached.
 */
export const insertIfNew = mutation({
  args: {
    upworkJobId: v.string(),
    title: v.string(),
    description: v.string(),
    budgetType: v.union(v.literal("fixed"), v.literal("hourly")),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    skillsRequired: v.array(v.string()),
    clientRating: v.optional(v.number()),
    clientPaymentVerified: v.boolean(),
    clientCountry: v.optional(v.string()),
    postedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check for existing job by Upwork job ID
    const existing = await ctx.db
      .query("jobsCache")
      .withIndex("by_upwork_job_id", (q) =>
        q.eq("upworkJobId", args.upworkJobId)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("jobsCache", {
      ...args,
      fetchedAt: Date.now(),
    });
  },
});

/**
 * Get a job by its internal ID.
 */
export const getById = query({
  args: { jobId: v.id("jobsCache") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

/**
 * Get a job by its Upwork job ID.
 */
export const getByUpworkId = query({
  args: { upworkJobId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobsCache")
      .withIndex("by_upwork_job_id", (q) =>
        q.eq("upworkJobId", args.upworkJobId)
      )
      .first();
  },
});
