import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ScorerResult, CaseStudy } from "@/types";
import { SCORER_SYSTEM_PROMPT, buildScorerPrompt } from "./prompts";
import { truncate } from "@/lib/utils";

/** AI relevance score threshold — below this, proposals are skipped */
const SCORE_THRESHOLD = 6;

/**
 * Score a job's relevance to a freelancer using Gemini flash-lite.
 * Returns the parsed score result.
 */
export async function scoreJobRelevance(
  apiKey: string,
  skills: string[],
  jobTitle: string,
  jobDescription: string,
  budget: string
): Promise<ScorerResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  // Truncate description to 600 chars per spec
  const truncatedDesc = truncate(jobDescription, 600);
  const userPrompt = buildScorerPrompt(skills, jobTitle, truncatedDesc, budget);

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: SCORER_SYSTEM_PROMPT,
    });

    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    const parsed: ScorerResult = JSON.parse(cleanJson);

    // Validate the shape
    if (typeof parsed.score !== "number" || typeof parsed.skip !== "boolean") {
      throw new Error("Invalid scorer response shape");
    }

    return parsed;
  } catch (error) {
    console.error("AI scoring failed:", error);
    // On failure, return a conservative skip response to avoid wasting drafter tokens
    return {
      score: 0,
      reason: "Scoring failed — skipping to avoid wasted API calls",
      skip: true,
      skipReason: "AI scoring error",
    };
  }
}

/**
 * Check if a job should be drafted based on its relevance score.
 */
export function shouldDraftProposal(result: ScorerResult): boolean {
  return result.score >= SCORE_THRESHOLD && !result.skip;
}

/**
 * Apply hard filters to a job before AI scoring.
 * Returns true if the job passes all filters (should proceed to AI scoring).
 * This is a zero-cost, instant check — no AI calls.
 */
export function hardFilter(
  job: {
    title: string;
    description: string;
    budgetMin?: number;
    budgetMax?: number;
    clientPaymentVerified: boolean;
    clientRating?: number;
  },
  filters: {
    minBudget: number;
    requiredKeywords: string[];
    excludedKeywords: string[];
    requirePaymentVerified: boolean;
    minClientRating: number;
  }
): boolean {
  // Check minimum budget
  const jobBudget = job.budgetMax ?? job.budgetMin ?? 0;
  if (jobBudget > 0 && jobBudget < filters.minBudget) {
    return false;
  }

  // Check required keywords (ALL must appear in title or description)
  const jobText = `${job.title} ${job.description}`.toLowerCase();
  if (filters.requiredKeywords.length > 0) {
    const allPresent = filters.requiredKeywords.every((kw) =>
      jobText.includes(kw.toLowerCase())
    );
    if (!allPresent) return false;
  }

  // Check excluded keywords (ANY match = skip)
  if (filters.excludedKeywords.length > 0) {
    const anyExcluded = filters.excludedKeywords.some((kw) =>
      jobText.includes(kw.toLowerCase())
    );
    if (anyExcluded) return false;
  }

  // Check payment verification
  if (filters.requirePaymentVerified && !job.clientPaymentVerified) {
    return false;
  }

  // Check minimum client rating
  if (
    job.clientRating !== undefined &&
    job.clientRating < filters.minClientRating
  ) {
    return false;
  }

  return true;
}

/**
 * Select the most relevant case study for a job.
 * Uses keyword overlap between job text and case study skills.
 */
export function selectBestCaseStudy(
  caseStudies: CaseStudy[],
  job: { title: string; description: string; skillsRequired: string[] }
): CaseStudy | null {
  if (!caseStudies.length) return null;

  const jobText =
    `${job.title} ${job.description} ${job.skillsRequired.join(" ")}`.toLowerCase();

  return caseStudies
    .map((cs) => ({
      ...cs,
      score: cs.skillsUsed.filter((skill) =>
        jobText.includes(skill.toLowerCase())
      ).length,
    }))
    .sort((a, b) => b.score - a.score)[0];
}
