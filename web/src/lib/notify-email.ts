/**
 * Server-only helper that emails AutoSell admins when a new listing is submitted.
 *
 * Requires (set in Vercel + .env.local):
 *   RESEND_API_KEY        - API key from https://resend.com
 *   NOTIFY_EMAIL_TO       - destination address (comma-separated for multiple)
 *   NOTIFY_EMAIL_FROM     - optional sender (defaults to "AutoSell Ghana <onboarding@resend.dev>")
 *
 * If RESEND_API_KEY or NOTIFY_EMAIL_TO is missing, this no-ops silently so the
 * submission flow never fails because of email.
 */
import { Resend } from "resend";
import type { CarSubmissionInsertInput } from "@/lib/car-submission-insert";
import { getSiteUrl } from "@/lib/site-url";

export type ListingNotificationInput = CarSubmissionInsertInput & {
  submissionId?: number | null;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label: string, value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const safe = escapeHtml(String(value));
  return `<tr><td style="padding:6px 12px;color:#6B7280;font:500 13px system-ui,sans-serif;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:6px 12px;color:#1A1F2E;font:500 14px system-ui,sans-serif">${safe}</td></tr>`;
}

function buildHtml(input: ListingNotificationInput): string {
  const adminUrl = `${getSiteUrl()}/admin`;
  const title = `${input.car_make} ${input.car_model}`.trim();
  const photoCount = input.photos?.length ?? 0;
  const photoBlock = photoCount
    ? `<p style="margin:0 0 12px;color:#1A1F2E;font:500 14px system-ui">${photoCount} photo(s) attached. First three previews:</p>` +
      (input.photos ?? [])
        .slice(0, 3)
        .map(
          (u) =>
            `<a href="${escapeHtml(u)}" style="display:inline-block;margin:0 8px 8px 0"><img src="${escapeHtml(u)}" alt="photo" width="120" style="border-radius:8px;border:1px solid #E2E6EA;object-fit:cover" /></a>`
        )
        .join("")
    : `<p style="margin:0 0 12px;color:#9CA3AF;font:500 14px system-ui">No photos attached.</p>`;

  return `<!doctype html>
<html><body style="margin:0;background:#F4F6F8;padding:24px;font-family:system-ui,-apple-system,Segoe UI,sans-serif">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #E2E6EA">
    <div style="background:#1A1F2E;color:#fff;padding:18px 24px">
      <div style="font:600 13px system-ui;letter-spacing:.08em;color:#E8500A;text-transform:uppercase">New car listing</div>
      <div style="font:700 22px system-ui;margin-top:4px">${escapeHtml(title)}${input.submissionId ? ` <span style="color:#9CA3AF;font-weight:500">#${input.submissionId}</span>` : ""}</div>
      <div style="color:#9CA3AF;font:500 14px system-ui;margin-top:4px">₵${escapeHtml(String(input.price))} · ${escapeHtml(input.location)}</div>
    </div>
    <div style="padding:20px 24px">
      ${photoBlock}
      <table style="border-collapse:collapse;width:100%;background:#F8FAFC;border:1px solid #E2E6EA;border-radius:10px;overflow:hidden">
        ${row("Make / Model", `${input.car_make} ${input.car_model}`)}
        ${row("Year", input.year)}
        ${row("Mileage", `${input.mileage} km`)}
        ${row("Condition", input.car_condition)}
        ${row("Transmission", input.transmission)}
        ${row("Fuel", input.fuel_type)}
        ${row("Package", input.package_type)}
        ${row("Description", input.car_description)}
        ${row("Seller", input.seller_name)}
        ${row("Phone", input.seller_phone)}
        ${row("Email", input.seller_email)}
        ${row("Preferred contact", input.preferred_contact)}
        ${row("Additional info", input.additional_info)}
      </table>
      <div style="margin-top:20px;text-align:center">
        <a href="${adminUrl}" style="display:inline-block;background:#E8500A;color:#fff;text-decoration:none;font:600 14px system-ui;padding:12px 22px;border-radius:10px">Open admin dashboard →</a>
      </div>
      <p style="margin:18px 0 0;color:#6B7280;font:500 12px system-ui;text-align:center">Status starts as <b>new</b>. Mark it <b>completed</b> in the dashboard to publish on /cars.</p>
    </div>
  </div>
</body></html>`;
}

function buildText(input: ListingNotificationInput): string {
  const lines = [
    `NEW CAR LISTING${input.submissionId ? ` #${input.submissionId}` : ""}`,
    `${input.car_make} ${input.car_model} — ₵${input.price} — ${input.location}`,
    "",
    `Year: ${input.year}`,
    `Mileage: ${input.mileage} km`,
    `Condition: ${input.car_condition}`,
    `Transmission: ${input.transmission}`,
    `Fuel: ${input.fuel_type}`,
    `Package: ${input.package_type}`,
    "",
    `Seller: ${input.seller_name}`,
    `Phone: ${input.seller_phone}`,
    input.seller_email ? `Email: ${input.seller_email}` : "Email: —",
    `Preferred contact: ${input.preferred_contact}`,
    "",
    `Description:\n${input.car_description}`,
    "",
    `Open admin: ${getSiteUrl()}/admin`,
  ];
  return lines.join("\n");
}

export async function notifyNewListing(input: ListingNotificationInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.NOTIFY_EMAIL_TO?.trim();
  if (!apiKey || !to) return;

  const from =
    process.env.NOTIFY_EMAIL_FROM?.trim() || "AutoSell Ghana <onboarding@resend.dev>";

  const recipients = to
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (recipients.length === 0) return;

  const title = `${input.car_make} ${input.car_model}`.trim();
  const subject = `New listing${input.submissionId ? ` #${input.submissionId}` : ""}: ${title} — ₵${input.price}`;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: recipients,
      subject,
      html: buildHtml(input),
      text: buildText(input),
    });
  } catch (err) {
    console.error("[notify-email] Failed to send notification", err);
  }
}
