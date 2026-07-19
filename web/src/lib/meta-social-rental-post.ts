import type { RentalListing } from "@/types/rental-listing";
import { normalizePhotos, parseListingYear } from "@/types/rental-listing";
import { getSiteUrl } from "@/lib/site-url";
import { postContentToMetaSocial } from "@/lib/meta-social-post";
import type { MetaPostResult } from "@/lib/meta-social-post";

type RentalWithPartnerName = RentalListing & {
  rental_partners?: { business_name?: string | null } | null;
};

function buildRateText(listing: RentalListing): string {
  const daily =
    listing.daily_rate > 0 ? `₵${listing.daily_rate.toLocaleString("en-GH")}/day` : "";
  const monthly = listing.monthly_rate
    ? `₵${listing.monthly_rate.toLocaleString("en-GH")}/month`
    : "";

  if (listing.listing_type === "lease") return monthly || daily;
  if (listing.listing_type === "both") return [daily, monthly].filter(Boolean).join(" · ");
  return daily || monthly;
}

export function buildRentalSocialCaption(listing: RentalWithPartnerName): string {
  const title = `${listing.car_make} ${listing.car_model}`.trim();
  const year = parseListingYear(listing.year) ?? String(listing.year ?? "");
  const rate = buildRateText(listing);
  const loc = listing.location?.trim() ?? "";
  const business = listing.rental_partners?.business_name?.trim();
  const url = `${getSiteUrl()}/rentals/${listing.id}`;

  const lines = [
    "🔑 Available for Rent on AutoSell Ghana 🚗🔥",
    "",
    `${title}${year ? ` · ${year}` : ""}`,
    `Rate: ${rate}${loc ? ` · ${loc}` : ""}`,
  ];
  if (business) lines.push(`Listed by ${business}`);
  lines.push(
    "",
    "DM us to book this car NOW. First come, first serve.",
    "",
    `View & book: ${url}`,
    "",
    "Message us on WhatsApp for any rental you need, we'll help you arrange it.",
    "",
    "#CarRentalGhana #RentACarGhana #AutoSellGhana"
  );
  return lines.join("\n");
}

/** Post one rental vehicle to Facebook Page and (if configured) Instagram. */
export async function postRentalListingToMetaSocial(
  listing: RentalWithPartnerName
): Promise<MetaPostResult> {
  const photos = normalizePhotos(listing.photos);
  const imageUrl = photos[0];
  const link = `${getSiteUrl()}/rentals/${listing.id}`;
  const caption = buildRentalSocialCaption(listing);
  return postContentToMetaSocial({ caption, link, imageUrl });
}
