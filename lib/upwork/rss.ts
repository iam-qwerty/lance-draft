import { XMLParser } from "fast-xml-parser";
import type { RawJob } from "@/types";

/** User agent string for RSS requests */
const USER_AGENT = "LanceDraft/1.0 (contact: hello@lancedraft.com)";

/**
 * Fetch jobs from Upwork's public RSS feed for a given search query.
 * Returns parsed job items. Throws on network or parse errors.
 */
export async function fetchJobsFromRSS(query: string): Promise<RawJob[]> {
  const url = `https://www.upwork.com/ab/feed/jobs/rss?q=${encodeURIComponent(query)}&sort=recency`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`RSS fetch failed: ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();
  return parseRSSFeed(xml);
}

/**
 * Parse the RSS XML into structured RawJob objects.
 * Handles the standard RSS 2.0 format used by Upwork.
 */
export function parseRSSFeed(xml: string): RawJob[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const parsed = parser.parse(xml);

  // Handle both array and single item cases
  const items = parsed?.rss?.channel?.item;
  if (!items) return [];

  const itemArray = Array.isArray(items) ? items : [items];

  return itemArray.map((item: Record<string, unknown>) => parseRSSItem(item));
}

/**
 * Parse a single RSS item into a RawJob.
 * Extracts budget, skills, and client info from the description HTML.
 */
function parseRSSItem(item: Record<string, unknown>): RawJob {
  const title = String(item.title || "");
  const description = cleanDescription(String(item.description || ""));
  const link = String(item.link || "");
  const pubDate = String(item.pubDate || "");

  // Extract Upwork job ID from link (e.g., "~123456" from the URL)
  const jobIdMatch = link.match(/~(\w+)/);
  const upworkJobId = jobIdMatch ? jobIdMatch[1] : link;

  // Parse budget from description (Upwork includes it in a <b>Budget</b> tag)
  const budget = extractBudget(String(item.description || ""));

  // Parse skills from description
  const skills = extractSkills(String(item.description || ""));

  return {
    upworkJobId,
    title,
    description,
    budgetType: budget.type,
    budgetMin: budget.min,
    budgetMax: budget.max,
    skillsRequired: skills,
    clientPaymentVerified: false, // Not available in RSS
    postedAt: pubDate ? new Date(pubDate).getTime() : Date.now(),
    link,
  };
}

/**
 * Remove HTML tags from the RSS description, keeping plain text.
 */
function cleanDescription(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract budget information from the RSS item description.
 * Upwork RSS includes budget as: "Budget: $500" or "Hourly Range: $25-$50"
 */
function extractBudget(html: string): {
  type: "fixed" | "hourly";
  min?: number;
  max?: number;
} {
  // Fixed price: "Budget: $500" or "Budget: $1,000"
  const fixedMatch = html.match(/Budget<\/b>:\s*\$([0-9,]+)/i);
  if (fixedMatch) {
    const amount = parseFloat(fixedMatch[1].replace(/,/g, ""));
    return { type: "fixed", min: amount, max: amount };
  }

  // Hourly range: "Hourly Range: $25.00-$50.00"
  const hourlyMatch = html.match(
    /Hourly Range<\/b>:\s*\$([0-9,.]+)\s*-\s*\$([0-9,.]+)/i
  );
  if (hourlyMatch) {
    return {
      type: "hourly",
      min: parseFloat(hourlyMatch[1].replace(/,/g, "")),
      max: parseFloat(hourlyMatch[2].replace(/,/g, "")),
    };
  }

  // Default to fixed with no budget info
  return { type: "fixed" };
}

/**
 * Extract skills from the RSS item description.
 * Upwork RSS includes skills as: "Skills: React, Node.js, TypeScript"
 */
function extractSkills(html: string): string[] {
  const skillsMatch = html.match(/Skills<\/b>:\s*([^<]+)/i);
  if (!skillsMatch) return [];

  return skillsMatch[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
