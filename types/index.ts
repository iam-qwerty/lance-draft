// ============================================================
// Shared TypeScript types for LanceDraft
// All types derived from convex/schema.ts (the authoritative schema)
// ============================================================

/** Proposal lifecycle status */
export type ProposalStatus =
  | "draft"
  | "queued"
  | "sent"
  | "skipped"
  | "discarded"
  | "failed";

/** Subscription plan IDs */
export type PlanId = "free" | "starter" | "pro" | "agency";

/** Freelancer writing tone */
export type Tone = "conversational" | "professional" | "technical";

/** Budget type for a job posting */
export type BudgetType = "fixed" | "hourly";

/** A case study in the freelancer's portfolio */
export interface CaseStudy {
  title: string;
  problem: string;
  solution: string;
  result: string; // Must include a metric: "reduced load by 40%"
  skillsUsed: string[];
}

/** Raw job data from RSS feed before storing in DB */
export interface RawJob {
  upworkJobId: string;
  title: string;
  description: string;
  budgetType: BudgetType;
  budgetMin?: number;
  budgetMax?: number;
  skillsRequired: string[];
  clientRating?: number;
  clientPaymentVerified: boolean;
  clientCountry?: string;
  postedAt: number; // Unix timestamp
  link: string;
}

/** AI relevance scorer output — must be exactly this JSON shape */
export interface ScorerResult {
  score: number; // 0–10
  reason: string; // max 20 words
  skip: boolean;
  skipReason: string; // empty string if skip is false
}

/** Plan limits configuration */
export interface PlanLimits {
  proposalsPerMonth: number;
  maxAccounts: number;
}

/** Map of plan ID to limits */
export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: { proposalsPerMonth: 0, maxAccounts: 1 },
  starter: { proposalsPerMonth: 20, maxAccounts: 1 },
  pro: { proposalsPerMonth: 80, maxAccounts: 1 },
  agency: { proposalsPerMonth: 300, maxAccounts: 3 },
};

/** Hard cap — maxProposalsPerDay cannot exceed this */
export const MAX_PROPOSALS_PER_DAY = 15;
