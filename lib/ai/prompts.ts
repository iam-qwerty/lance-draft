// ============================================================
// AI Prompt Templates — Single source of truth
// All prompts used by the Gemini scorer and drafter live here.
// ============================================================

/**
 * System prompt for the relevance scorer.
 * Used with gemini-2.0-flash-lite.
 */
export const SCORER_SYSTEM_PROMPT = `You are a relevance filter for a freelancer's job search. You receive a job posting and the freelancer's skills. Return ONLY valid JSON. No markdown, no explanation.

Score relevance from 0 to 10:
10 = perfect match, all required skills present, budget is appropriate
7-9 = strong match, most skills present
5-6 = partial match, some relevant skills
0-4 = poor match, different domain or missing core skills

Also set "skip" to true if:
- The job is clearly outside the freelancer's domain
- The description is too vague to write a meaningful proposal
- The job requires in-person work or a specific location the freelancer can't meet
- The job is asking for something unethical or suspicious

Return exactly this shape:
{
  "score": number,
  "reason": string (max 20 words explaining the score),
  "skip": boolean,
  "skipReason": string (only if skip is true, else empty string)
}`;

/**
 * Build the user prompt for the relevance scorer.
 */
export function buildScorerPrompt(
  skills: string[],
  jobTitle: string,
  jobDescription: string,
  budget: string
): string {
  return `Freelancer skills: ${skills.join(", ")}

Job title: ${jobTitle}
Job description: ${jobDescription}
Budget: ${budget}`;
}

/**
 * System prompt for the proposal drafter.
 * Used with gemini-2.0-flash.
 */
export const DRAFTER_SYSTEM_PROMPT = `You write Upwork proposals for a skilled freelancer. Your proposals win because they feel personal, specific, and credible — not generic.

RULES (follow every single one):
1. NEVER start with "I". Starting with "I" is the #1 proposal mistake.
2. NEVER use these phrases: "I am writing to express interest", "I believe I am a great fit", "I am excited about this opportunity", "Please find", "I am a passionate", "As an experienced". These are red flags for clients.
3. OPEN by referencing a specific detail from the job description — prove you read it. Do not just restate the job title.
4. MENTION one concrete piece of relevant past work: what you built, the problem it solved, and a real result (metric preferred). Use the case study provided.
5. ANSWER the unspoken question: why you specifically, not just any qualified person.
6. END with a clear, low-friction call to action. A specific question or offer of a quick call. Not "Looking forward to hearing from you."
7. LENGTH: 200–350 words. Every sentence earns its place.
8. TONE: Match the tone field in the profile exactly.
9. FORMAT: Plain text only. No markdown, no bullet points, no headers. This is pasted directly into Upwork's text field.
10. Do NOT summarize the job back to the client. They wrote it.`;

/**
 * Build the user prompt for the proposal drafter.
 */
export function buildDrafterPrompt(
  profile: {
    skills: string[];
    hourlyRateMin: number;
    hourlyRateMax: number;
    bio: string;
    tone: string;
  },
  caseStudy: {
    title: string;
    problem: string;
    solution: string;
    result: string;
  } | null,
  writingSample: string | null,
  job: {
    title: string;
    description: string;
    skillsRequired: string[];
    budgetMin?: number;
    budgetMax?: number;
  }
): string {
  const budgetStr =
    job.budgetMin && job.budgetMax
      ? `$${job.budgetMin}–$${job.budgetMax}`
      : job.budgetMin
        ? `$${job.budgetMin}`
        : "Not specified";

  let prompt = `FREELANCER PROFILE:
Skills: ${profile.skills.join(", ")}
Hourly rate: $${profile.hourlyRateMin}–$${profile.hourlyRateMax}/hr
Bio: ${profile.bio}
Tone: ${profile.tone}`;

  if (caseStudy) {
    prompt += `

MOST RELEVANT CASE STUDY:
Title: ${caseStudy.title}
Problem they faced: ${caseStudy.problem}
What I did: ${caseStudy.solution}
Result: ${caseStudy.result}`;
  }

  if (writingSample) {
    prompt += `

WRITING STYLE REFERENCE (match this voice):
${writingSample}`;
  }

  prompt += `

JOB POSTING:
Title: ${job.title}
Budget: ${budgetStr}
Required skills: ${job.skillsRequired.join(", ")}
Description:
${job.description}

Write the proposal now. Follow all rules. Plain text only.`;

  return prompt;
}
