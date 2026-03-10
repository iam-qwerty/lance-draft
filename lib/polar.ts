/**
 * Polar.sh client utilities.
 * Handles checkout URL generation and webhook event types.
 */

/** Polar.sh checkout URL for upgrading plans */
export function getPolarCheckoutUrl(
  planSlug: string,
  clerkId: string
): string {
  // Polar.sh uses a hosted checkout — pass metadata for callback
  const baseUrl = "https://polar.sh/checkout";
  const params = new URLSearchParams({
    product: planSlug,
    metadata_clerkId: clerkId,
  });

  return `${baseUrl}?${params.toString()}`;
}

/** Polar webhook event types we handle */
export type PolarWebhookEvent =
  | "subscription.created"
  | "subscription.updated"
  | "subscription.canceled"
  | "payment.failed";
