import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get the freelancer profile for an Upwork account.
 */
export const getByAccount = query({
  args: { upworkAccountId: v.id("upworkAccounts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("freelancerProfiles")
      .withIndex("by_account", (q) =>
        q.eq("upworkAccountId", args.upworkAccountId)
      )
      .first();
  },
});

/**
 * Create or update a freelancer profile.
 * Uses upsert pattern — creates if not exists, patches if exists.
 */
export const upsert = mutation({
  args: {
    upworkAccountId: v.id("upworkAccounts"),
    bio: v.string(),
    skills: v.array(v.string()),
    hourlyRateMin: v.number(),
    hourlyRateMax: v.number(),
    tone: v.union(
      v.literal("conversational"),
      v.literal("professional"),
      v.literal("technical")
    ),
    caseStudies: v.array(
      v.object({
        title: v.string(),
        problem: v.string(),
        solution: v.string(),
        result: v.string(),
        skillsUsed: v.array(v.string()),
      })
    ),
    writingSamples: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("freelancerProfiles")
      .withIndex("by_account", (q) =>
        q.eq("upworkAccountId", args.upworkAccountId)
      )
      .first();

    // Calculate isComplete flag per spec:
    // bio >= 50 chars AND skills >= 1 AND caseStudies >= 1
    // AND every case study has non-empty title, problem, solution, result
    const isComplete =
      args.bio.length >= 50 &&
      args.skills.length >= 1 &&
      args.caseStudies.length >= 1 &&
      args.caseStudies.every(
        (cs) =>
          cs.title.trim().length > 0 &&
          cs.problem.trim().length > 0 &&
          cs.solution.trim().length > 0 &&
          cs.result.trim().length > 0
      );

    const profileData = {
      upworkAccountId: args.upworkAccountId,
      bio: args.bio,
      skills: args.skills,
      hourlyRateMin: args.hourlyRateMin,
      hourlyRateMax: args.hourlyRateMax,
      tone: args.tone,
      caseStudies: args.caseStudies,
      writingSamples: args.writingSamples,
      isComplete,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, profileData);
      return existing._id;
    }

    return await ctx.db.insert("freelancerProfiles", profileData);
  },
});
