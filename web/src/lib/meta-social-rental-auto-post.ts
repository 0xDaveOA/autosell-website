import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RentalListing } from "@/types/rental-listing";
import { getRentalListingStatuses } from "@/lib/rental-listings";
import { isMetaAutoPostConfigured } from "@/lib/meta-social-config";
import { postRentalListingToMetaSocial } from "@/lib/meta-social-rental-post";

/** Max vehicles auto-posted in one burst when a partner is approved (spam control). */
const PARTNER_APPROVAL_POST_LIMIT = 3;

/** Kept stable — the admin badge shows an amber "Not posted" state for errors with this prefix. */
const SKIP_PARTNER_NOT_APPROVED = "Skipped: partner not approved yet.";

export type RentalMetaPostRunResult = {
  ok: boolean;
  alreadyPosted?: boolean;
  skipped?: "not-active" | "partner-not-approved";
  fbPostId?: string;
  error?: string;
};

function isPublishedRentalStatus(status: string): boolean {
  return getRentalListingStatuses().includes(status.trim());
}

/**
 * When a rental vehicle newly goes live (status → active), post to Facebook/Instagram once.
 * Fire-and-forget from API routes — errors are logged and stored on the row.
 */
export function scheduleRentalMetaAutoPostIfNeeded(
  service: SupabaseClient,
  listingId: number,
  opts: { previousStatus?: string | null; newStatus: string }
): void {
  if (!isMetaAutoPostConfigured()) return;

  const wasPublished = opts.previousStatus ? isPublishedRentalStatus(opts.previousStatus) : false;
  const nowPublished = isPublishedRentalStatus(opts.newStatus);
  if (!nowPublished || wasPublished) return;

  // Must use after() on Vercel — bare void promises are killed when the route returns.
  after(() => runRentalMetaAutoPost(service, listingId));
}

/**
 * When a partner newly becomes approved, their already-active vehicles become publicly
 * visible without a listing status transition — auto-post up to a few of them.
 * The rest stay unposted and can be posted manually from the admin dashboard.
 */
export function schedulePartnerApprovalMetaPosts(
  service: SupabaseClient,
  partnerId: number,
  opts: { previousStatus?: string | null; newStatus: string }
): void {
  if (!isMetaAutoPostConfigured()) return;
  if (opts.newStatus !== "approved" || opts.previousStatus === "approved") return;

  after(async () => {
    const { data, error } = await service
      .from("rental_listings")
      .select("id")
      .eq("partner_id", partnerId)
      .in("status", getRentalListingStatuses())
      .is("meta_social_posted_at", null)
      .order("created_at", { ascending: true })
      .limit(PARTNER_APPROVAL_POST_LIMIT);

    if (error) {
      console.error("rental meta partner-approval query", error.message);
      return;
    }

    for (const row of data ?? []) {
      await runRentalMetaAutoPost(service, row.id as number);
    }
  });
}

export async function runRentalMetaAutoPost(
  service: SupabaseClient,
  listingId: number
): Promise<RentalMetaPostRunResult> {
  const { data: row, error: loadErr } = await service
    .from("rental_listings")
    .select("*, rental_partners(id, business_name, status)")
    .eq("id", listingId)
    .maybeSingle();

  if (loadErr || !row) {
    console.error("rental meta auto-post load", loadErr?.message ?? "not found");
    return { ok: false, error: loadErr?.message ?? "Rental listing not found." };
  }

  const listing = row as RentalListing & {
    rental_partners?: { id: number; business_name?: string | null; status?: string | null } | null;
  };

  if (listing.meta_social_posted_at) return { ok: true, alreadyPosted: true };

  if (!isPublishedRentalStatus(listing.status)) {
    // Only reachable via manual repost — don't clobber any real prior error.
    return { ok: false, skipped: "not-active", error: "Listing is not active." };
  }

  if (listing.rental_partners?.status !== "approved") {
    await service
      .from("rental_listings")
      .update({
        meta_social_last_error: SKIP_PARTNER_NOT_APPROVED,
        updated_at: new Date().toISOString(),
      })
      .eq("id", listingId);
    return { ok: false, skipped: "partner-not-approved", error: SKIP_PARTNER_NOT_APPROVED };
  }

  const result = await postRentalListingToMetaSocial(listing);

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (result.ok) {
    patch.meta_social_posted_at = new Date().toISOString();
    patch.meta_fb_post_id = result.fbPostId ?? null;
    patch.meta_ig_media_id = result.igMediaId ?? null;
    patch.meta_social_last_error = null;
  } else {
    patch.meta_social_last_error = result.error?.slice(0, 500) ?? "Meta post failed";
    if (result.fbPostId) patch.meta_fb_post_id = result.fbPostId;
    console.error("rental meta auto-post", listingId, result.error);
  }

  const { error: upErr } = await service.from("rental_listings").update(patch).eq("id", listingId);
  if (upErr) console.error("rental meta auto-post update", upErr.message);

  return { ok: result.ok, fbPostId: result.fbPostId, error: result.error };
}
