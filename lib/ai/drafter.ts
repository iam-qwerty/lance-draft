import { GoogleGenerativeAI } from "@google/generative-ai";
import { DRAFTER_SYSTEM_PROMPT, buildDrafterPrompt } from "./prompts";
import type { CaseStudy } from "@/types";

/**
 * Draft a personalized Upwork proposal using Gemini flash.
 * Returns the plain-text proposal content (200–350 words).
 */
export async function draftProposal(
  apiKey: string,
  profile: {
    skills: string[];
    hourlyRateMin: number;
    hourlyRateMax: number;
    bio: string;
    tone: string;
  },
  caseStudy: CaseStudy | null,
  writingSample: string | null,
  job: {
    title: string;
    description: string;
    skillsRequired: string[];
    budgetMin?: number;
    budgetMax?: number;
  }
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const userPrompt = buildDrafterPrompt(profile, caseStudy, writingSample, job);

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: DRAFTER_SYSTEM_PROMPT,
    });

    const text = result.response.text().trim();

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return text;
  } catch (error) {
    throw new Error(`Failed to draft proposal: ${error}`);
  }
}
