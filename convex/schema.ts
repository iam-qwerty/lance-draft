import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Synced from Clerk via webhook on user creation
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    planId: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("agency")
    ),
    proposalsUsedThisMonth: v.number(),
    billingPeriodStart: v.string(), // ISO date string
    polarCustomerId: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(), // Unix timestamp
  }).index("by_clerk_id", ["clerkId"]),

  // One per connected Upwork account (Agency plan allows up to 3)
  upworkAccounts: defineTable({
    userId: v.id("users"),
    upworkUserId: v.string(),
    displayName: v.string(),
    accessToken: v.string(), // Encrypted at rest
    refreshToken: v.string(), // Encrypted at rest
    tokenExpiresAt: v.number(), // Unix timestamp
    isActive: v.boolean(),
    connectedAt: v.number(),
  }).index("by_user", ["userId"]),

  // One per upworkAccount — the AI's context for writing proposals
  freelancerProfiles: defineTable({
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
        result: v.string(), // Must include a metric
        skillsUsed: v.array(v.string()),
      })
    ),
    writingSamples: v.array(v.string()), // Up to 3 past proposals
    isComplete: v.boolean(),
    updatedAt: v.number(),
  }).index("by_account", ["upworkAccountId"]),

  // One per upworkAccount — what jobs to look for
  filterRules: defineTable({
    upworkAccountId: v.id("upworkAccounts"),
    minBudget: v.number(), // USD — skip jobs below this
    jobTypes: v.array(v.string()),
    requiredKeywords: v.array(v.string()), // ALL must appear
    excludedKeywords: v.array(v.string()), // ANY match = skip
    requirePaymentVerified: v.boolean(),
    minClientRating: v.number(), // 0.0 to 5.0
    maxProposalsPerDay: v.number(), // Hard cap — safety
    updatedAt: v.number(),
  }).index("by_account", ["upworkAccountId"]),

  // Global cache of fetched Upwork jobs — shared across users
  jobsCache: defineTable({
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
    fetchedAt: v.number(),
  }).index("by_upwork_job_id", ["upworkJobId"]),

  // One row per (account, job) pair — prevents reprocessing
  proposals: defineTable({
    upworkAccountId: v.id("upworkAccounts"),
    jobId: v.id("jobsCache"),
    content: v.string(), // The AI-drafted proposal text
    aiRelevanceScore: v.number(), // 0–10 from Gemini scorer
    status: v.union(
      v.literal("draft"),
      v.literal("queued"),
      v.literal("sent"),
      v.literal("skipped"),
      v.literal("discarded"),
      v.literal("failed")
    ),
    upworkProposalId: v.optional(v.string()),
    userEditedContent: v.optional(v.string()),
    sentAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_account", ["upworkAccountId"])
    .index("by_account_and_job", ["upworkAccountId", "jobId"])
    .index("by_status", ["status"]),
});
