import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CarSubmission } from "@/types/car-submission";
import { getListingStatuses } from "@/lib/listings";
import { isMetaAutoPostConfigured } from "@/lib/meta-social-config";
import { postListingToMetaSocial } from "@/lib/meta-social-post";

function isPublishedStatus(status: string): boolean {
  const published = getListingStatuses();
  return published.includes(status.trim());
}

/**
 * When a listing newly goes live (e.g. status → completed), post to Facebook/Instagram once.
 * Fire-and-forget from API routes — errors are logged and stored on the row.
 */
export function scheduleMetaAutoPostIfNeeded(
  service: SupabaseClient,
  listingId: number,
  opts: { previousStatus?: string | null; newStatus: string }
): void {
  if (!isMetaAutoPostConfigured()) return;

  const wasPublished = opts.previousStatus ? isPublishedStatus(opts.previousStatus) : false;
  const nowPublished = isPublishedStatus(opts.newStatus);
  if (!nowPublished || wasPublished) return;

  // Must use after() on Vercel — bare void promises are killed when the route returns.
  after(() => runMetaAutoPost(service, listingId));
}

export type MetaPostRunResult = {
  ok: boolean;
  alreadyPosted?: boolean;
  fbPostId?: string;
  error?: string;
};

export async function runMetaAutoPost(
  service: SupabaseClient,
  listingId: number
): Promise<MetaPostRunResult> {
  const { data: row, error: loadErr } = await service
    .from("car_submissions")
    .select("*")
    .eq("id", listingId)
    .maybeSingle();

  if (loadErr || !row) {
    console.error("meta auto-post load", loadErr?.message ?? "not found");
    return { ok: false, error: loadErr?.message ?? "Listing not found." };
  }

  const car = row as CarSubmission & {
    meta_social_posted_at?: string | null;
  };

  if (car.meta_social_posted_at) return { ok: true, alreadyPosted: true };

  const result = await postListingToMetaSocial(car);

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
    console.error("meta auto-post", listingId, result.error);
  }

  const { error: upErr } = await service.from("car_submissions").update(patch).eq("id", listingId);
  if (upErr) console.error("meta auto-post update", upErr.message);

  return { ok: result.ok, fbPostId: result.fbPostId, error: result.error };
}
