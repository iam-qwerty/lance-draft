import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/** Response shape from Upwork token endpoint */
interface UpworkTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/** Response shape from Upwork user profile endpoint */
interface UpworkProfileResponse {
  user?: {
    id?: string;
    name?: string;
  };
}

/**
 * Upwork OAuth callback handler.
 * Exchanges the authorization code for tokens and stores them in Convex.
 */
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    console.error("Upwork OAuth error:", error);
    return NextResponse.redirect(
      new URL("/onboarding?error=upwork_auth_failed", req.url)
    );
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch(
      "https://www.upwork.com/api/v3/oauth2/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: process.env.UPWORK_CLIENT_ID!,
          client_secret: process.env.UPWORK_CLIENT_SECRET!,
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/upwork/callback`,
        }),
      }
    );

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("Token exchange failed:", errorText);
      return NextResponse.redirect(
        new URL("/onboarding?error=token_exchange_failed", req.url)
      );
    }

    const tokenData = (await tokenRes.json()) as UpworkTokenResponse;

    // Get Upwork user profile
    const profileRes = await fetch(
      "https://www.upwork.com/api/v3/users/me",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    let displayName = "Upwork User";
    let upworkUserId = "unknown";

    if (profileRes.ok) {
      const profileData = (await profileRes.json()) as UpworkProfileResponse;
      displayName = profileData.user?.name || displayName;
      upworkUserId = profileData.user?.id || upworkUserId;
    }

    // Get the Convex user ID from Clerk ID
    const user = await convex.query(api.users.getByClerkId, { clerkId });
    if (!user) {
      return NextResponse.redirect(
        new URL("/onboarding?error=user_not_found", req.url)
      );
    }

    // Store the Upwork account in Convex
    // TODO: Encrypt tokens before storing (Phase 2 hardening)
    await convex.mutation(api.accounts.create, {
      userId: user._id,
      upworkUserId,
      displayName,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt: Date.now() + tokenData.expires_in * 1000,
    });

    return NextResponse.redirect(new URL("/onboarding?step=2", req.url));
  } catch (err) {
    console.error("Upwork callback error:", err);
    return NextResponse.redirect(
      new URL("/onboarding?error=callback_failed", req.url)
    );
  }
}
