/**
 * Upwork API client for proposal submission.
 * Uses stored OAuth tokens to submit proposals via the Upwork API.
 *
 * NOTE: This requires Upwork API approval which takes 1–5 business days.
 * Until approved, users can copy/paste proposals manually as a fallback.
 */

const UPWORK_API_BASE = "https://www.upwork.com/api";

/** Token expiry buffer — refresh if token expires within 5 minutes */
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

/** Response shape from Upwork token endpoint */
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/** Response shape from Upwork proposal submission */
interface ProposalResponse {
  proposal_id?: string;
  id?: string;
}

/**
 * Check if the Upwork access token needs to be refreshed.
 */
export function tokenNeedsRefresh(tokenExpiresAt: number): boolean {
  return tokenExpiresAt < Date.now() + TOKEN_REFRESH_BUFFER_MS;
}

/**
 * Refresh an Upwork OAuth token.
 * Returns new token data or throws on failure.
 */
export async function refreshUpworkToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}> {
  const res = await fetch(`${UPWORK_API_BASE}/v3/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${error}`);
  }

  const data = (await res.json()) as TokenResponse;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Submit a proposal to Upwork via their API.
 * Returns the Upwork proposal ID on success.
 *
 * CRITICAL: This must ONLY be called when the user clicks "Send" in the UI.
 * Never auto-submit proposals.
 */
export async function submitProposal(
  accessToken: string,
  jobId: string,
  proposalContent: string
): Promise<string> {
  const res = await fetch(
    `${UPWORK_API_BASE}/hr/v1/jobs/${jobId}/proposals`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cover_letter: proposalContent,
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Proposal submission failed: ${res.status} ${error}`);
  }

  const data = (await res.json()) as ProposalResponse;
  return data.proposal_id || data.id || "unknown";
}
