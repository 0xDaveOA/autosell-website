import type { CarSubmission } from "@/types/car-submission";
import { normalizePhotos, parseListingYear } from "@/types/car-submission";
import { getSiteUrl } from "@/lib/site-url";
import {
  getMetaGraphVersion,
  getMetaIgUserId,
  getMetaPageAccessToken,
  getMetaPageId,
} from "@/lib/meta-social-config";

export type MetaPostResult = {
  ok: boolean;
  fbPostId?: string;
  igMediaId?: string;
  error?: string;
};

type GraphError = {
  error?: { message?: string; type?: string; code?: number };
};

async function graphPost(
  path: string,
  params: Record<string, string>
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: string }> {
  const token = getMetaPageAccessToken();
  if (!token) return { ok: false, error: "META_PAGE_ACCESS_TOKEN is not set." };

  const version = getMetaGraphVersion();
  const body = new URLSearchParams({ ...params, access_token: token });

  const res = await fetch(`https://graph.facebook.com/${version}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown> & GraphError;
  if (!res.ok) {
    const msg = json.error?.message ?? `Graph API error (${res.status})`;
    return { ok: false, error: msg };
  }
  return { ok: true, data: json };
}

export function buildListingSocialCaption(car: CarSubmission): string {
  const title = `${car.car_make} ${car.car_model}`.trim();
  const year = parseListingYear(car.year) ?? String(car.year ?? "");
  const price = `₵${car.price.toLocaleString("en-GH")}`;
  const url = `${getSiteUrl()}/cars/${car.id}`;
  const loc = car.location.trim();

  return [
    "🚗 New listing on AutoSell Ghana",
    "",
    `${title}${year ? ` · ${year}` : ""}`,
    `${price}${loc ? ` · ${loc}` : ""}`,
    "",
    `View & enquire: ${url}`,
    "",
    "Message us on WhatsApp for any car you want — we'll help you find it.",
    "",
    "#AutoSellGhana #CarsForSaleGhana #UsedCarsGhana",
  ].join("\n");
}

async function postToFacebookPage(opts: {
  caption: string;
  link: string;
  imageUrl?: string;
}): Promise<{ ok: true; postId: string } | { ok: false; error: string }> {
  const pageId = getMetaPageId();
  if (!pageId) return { ok: false, error: "META_PAGE_ID is not set." };

  if (opts.imageUrl) {
    const photo = await graphPost(`/${pageId}/photos`, {
      url: opts.imageUrl,
      caption: `${opts.caption}\n\n${opts.link}`,
    });
    if (!photo.ok) return photo;
    const id = String(photo.data.post_id ?? photo.data.id ?? "");
    if (!id) return { ok: false, error: "Facebook photo post returned no id." };
    return { ok: true, postId: id };
  }

  const feed = await graphPost(`/${pageId}/feed`, {
    message: opts.caption,
    link: opts.link,
  });
  if (!feed.ok) return feed;
  const id = String(feed.data.id ?? "");
  if (!id) return { ok: false, error: "Facebook feed post returned no id." };
  return { ok: true, postId: id };
}

async function postToInstagram(opts: {
  caption: string;
  imageUrl: string;
}): Promise<{ ok: true; mediaId: string } | { ok: false; error: string }> {
  const igUserId = getMetaIgUserId();
  if (!igUserId) {
    return { ok: false, error: "META_IG_USER_ID is not set (skipping Instagram)." };
  }

  const container = await graphPost(`/${igUserId}/media`, {
    image_url: opts.imageUrl,
    caption: opts.caption,
  });
  if (!container.ok) return container;

  const creationId = String(container.data.id ?? "");
  if (!creationId) return { ok: false, error: "Instagram media container returned no id." };

  const publish = await graphPost(`/${igUserId}/media_publish`, {
    creation_id: creationId,
  });
  if (!publish.ok) return publish;

  const mediaId = String(publish.data.id ?? creationId);
  return { ok: true, mediaId };
}

/** Post one listing to Facebook Page and (if configured) Instagram. */
export async function postListingToMetaSocial(car: CarSubmission): Promise<MetaPostResult> {
  const photos = normalizePhotos(car.photos);
  const imageUrl = photos[0];
  const link = `${getSiteUrl()}/cars/${car.id}`;
  const caption = buildListingSocialCaption(car);

  const fb = await postToFacebookPage({ caption, link, imageUrl });
  if (!fb.ok) {
    return { ok: false, error: `Facebook: ${fb.error}` };
  }

  let igMediaId: string | undefined;
  if (imageUrl) {
    const ig = await postToInstagram({ caption: `${caption}\n\n${link}`, imageUrl });
    if (!ig.ok) {
      return {
        ok: false,
        fbPostId: fb.postId,
        error: `Facebook ok; Instagram: ${ig.error}`,
      };
    }
    igMediaId = ig.mediaId;
  }

  return { ok: true, fbPostId: fb.postId, igMediaId };
}
