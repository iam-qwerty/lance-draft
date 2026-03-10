import { NextResponse } from "next/server";

/**
 * Initiate Upwork OAuth connect flow.
 * Redirects the user to Upwork's authorization URL.
 */
export async function GET() {
  const clientId = process.env.UPWORK_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Upwork OAuth not configured" },
      { status: 500 }
    );
  }

  // Build Upwork authorization URL
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/upwork/callback`;
  const scopes = "jobs:read proposals:write profile:read";

  const authUrl = new URL("https://www.upwork.com/ab/account-security/oauth2/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scopes);
  // State parameter for CSRF protection
  authUrl.searchParams.set("state", crypto.randomUUID());

  return NextResponse.redirect(authUrl.toString());
}
