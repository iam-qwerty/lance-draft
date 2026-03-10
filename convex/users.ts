import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get a user by their Clerk ID.
 */
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

/**
 * Create a new user (called from Clerk webhook).
 */
export const create = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists (idempotent)
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      planId: "free",
      proposalsUsedThisMonth: 0,
      billingPeriodStart: new Date().toISOString().split("T")[0],
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

/**
 * Update user's plan (called from Polar webhook).
 */
export const updatePlan = mutation({
  args: {
    clerkId: v.string(),
    planId: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("agency")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error(`User not found: ${args.clerkId}`);

    await ctx.db.patch(user._id, {
      planId: args.planId,
      proposalsUsedThisMonth: 0,
    });
  },
});

/**
 * Increment the monthly proposal count after a successful send.
 */
export const incrementProposalCount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      proposalsUsedThisMonth: user.proposalsUsedThisMonth + 1,
    });
  },
});
