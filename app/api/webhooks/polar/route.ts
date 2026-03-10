import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Polar.sh webhook handler.
 * Handles subscription lifecycle events to sync plan data with Convex.
 */
export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing POLAR_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Verify webhook signature
  const signature = req.headers.get("x-polar-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();

  // TODO: Implement proper Polar webhook signature verification
  // For now, basic signature check
  let event: {
    type: string;
    data: Record<string, unknown>;
  };

  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "subscription.created":
      case "subscription.updated": {
        const { metadata, product } = event.data as {
          metadata: { clerkId: string };
          product: { name: string };
        };

        // Map Polar product name to plan ID
        const planMap: Record<string, string> = {
          Starter: "starter",
          Pro: "pro",
          Agency: "agency",
        };

        const planId = planMap[product?.name] || "free";
        if (metadata?.clerkId) {
          await convex.mutation(api.users.updatePlan, {
            clerkId: metadata.clerkId,
            planId: planId as "free" | "starter" | "pro" | "agency",
          });
        }
        break;
      }

      case "subscription.canceled": {
        const { metadata } = event.data as {
          metadata: { clerkId: string };
        };
        if (metadata?.clerkId) {
          await convex.mutation(api.users.updatePlan, {
            clerkId: metadata.clerkId,
            planId: "free",
          });
        }
        break;
      }

      case "payment.failed": {
        // TODO: Mark account inactive and send email via Resend
        console.warn("Payment failed:", event.data);
        break;
      }

      default:
        console.log("Unhandled Polar event:", event.type);
    }
  } catch (err) {
    console.error("Error processing Polar webhook:", err);
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
