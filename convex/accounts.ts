import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get all Upwork accounts for a user.
 */
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("upworkAccounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

/**
 * Create a new Upwork account connection.
 * Called after successful OAuth callback.
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    upworkUserId: v.string(),
    displayName: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    tokenExpiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("upworkAccounts", {
      ...args,
      isActive: true,
      connectedAt: Date.now(),
    });
  },
});

/**
 * Update tokens after a refresh.
 */
export const updateTokens = mutation({
  args: {
    accountId: v.id("upworkAccounts"),
    accessToken: v.string(),
    refreshToken: v.string(),
    tokenExpiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.accountId, {
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      tokenExpiresAt: args.tokenExpiresAt,
    });
  },
});

/**
 * Mark an account as inactive (e.g., token refresh failed).
 */
export const deactivate = mutation({
  args: { accountId: v.id("upworkAccounts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.accountId, { isActive: false });
  },
});
