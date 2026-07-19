/**
 * Server-only helper that emails the SELLER when their listing status changes.
 *
 * Sent when admin moves a listing to:
 *   completed → "Your listing is live" (with public link)
 *   rejected  → "Update on your listing" (with WhatsApp contact link)
 *
 * Requires RESEND_API_KEY. Uses NOTIFY_EMAIL_FROM as sender (same as admin
 * notifications). No-ops silently if the key or seller email is missing, so
 * the admin update flow never fails because of email.
 */
import { Resend } from "resend";
import { getSiteUrl } from "@/lib/site-url";
import { waLink } from "@/lib/whatsapp";

export type SellerStatusNotificationInput = {
  submissionId: number;
  sellerEmail: string | null | undefined;
  sellerName: string | null | undefined;
  title: string;
  price: number | null | undefined;
  newStatus: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function shell(headerEyebrow: string, headerTitle: string, bodyHtml: string): string {
  return `<!doctype html>
<html><body style="margin:0;background:#F4F6F8;padding:24px;font-family:system-ui,-apple-system,Segoe UI,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #E2E6EA">
    <div style="background:#1A1F2E;color:#fff;padding:18px 24px">
      <div style="font:600 13px system-ui;letter-spacing:.08em;color:#E8500A;text-transform:uppercase">${escapeHtml(headerEyebrow)}</div>
      <div style="font:700 22px system-ui;margin-top:4px">${headerTitle}</div>
    </div>
    <div style="padding:24px">${bodyHtml}</div>
    <div style="padding:14px 24px;border-top:1px solid #E2E6EA;color:#9CA3AF;font:500 12px system-ui;text-align:center">
      AutoSell Ghana · Ghana's fastest growing car marketplace · autosellgh.com
    </div>
  </div>
</body></html>`;
}

function button(href: string, label: string, bg = "#E8500A"): string {
  return `<div style="margin:20px 0;text-align:center"><a href="${escapeHtml(href)}" style="display:inline-block;background:${bg};color:#fff;text-decoration:none;font:600 14px system-ui;padding:12px 24px;border-radius:10px">${escapeHtml(label)}</a></div>`;
}

function greeting(name: string | null | undefined): string {
  const first = (name ?? "").trim().split(/\s+/)[0];
  return first ? `Hi ${escapeHtml(first)},` : "Hi,";
}

function buildLiveEmail(input: SellerStatusNotificationInput): { subject: string; html: string; text: string } {
  const listingUrl = `${getSiteUrl()}/cars/${input.submissionId}`;
  const safeTitle = escapeHtml(input.title);
  const priceLine =
    input.price != null ? ` at ₵${Number(input.price).toLocaleString("en-GH")}` : "";

  const html = shell(
    "Listing published",
    `Your ${safeTitle} is live! 🎉`,
    `
    <p style="margin:0 0 12px;color:#1A1F2E;font:500 15px system-ui">${greeting(input.sellerName)}</p>
    <p style="margin:0 0 12px;color:#4B5563;font:400 14px system-ui;line-height:1.6">
      Great news — your <b>${safeTitle}</b>${priceLine} has been approved and is now live on AutoSell Ghana.
      Buyers can see it, and we'll also share it on our Facebook and Instagram pages.
    </p>
    ${button(listingUrl, "View your listing →")}
    <p style="margin:0;color:#4B5563;font:400 14px system-ui;line-height:1.6">
      <b>Tip:</b> share your listing link with friends and on your WhatsApp status — listings shared by
      sellers get up to 3× more enquiries.
    </p>
    <p style="margin:16px 0 0;color:#6B7280;font:400 13px system-ui;line-height:1.6">
      When a buyer is interested, they'll contact us on WhatsApp and we'll connect you. No action needed from you right now.
    </p>`
  );

  const text = [
    `${greeting(input.sellerName).replace(/&#?\w+;/g, "")}`,
    "",
    `Great news — your ${input.title}${input.price != null ? ` at ₵${input.price}` : ""} has been approved and is now live on AutoSell Ghana.`,
    "",
    `View your listing: ${listingUrl}`,
    "",
    "Tip: share your listing link with friends and on your WhatsApp status for more enquiries.",
    "",
    "— AutoSell Ghana",
  ].join("\n");

  return { subject: `Your ${input.title} is now live on AutoSell Ghana 🎉`, html, text };
}

function buildRejectedEmail(input: SellerStatusNotificationInput): { subject: string; html: string; text: string } {
  const safeTitle = escapeHtml(input.title);
  const wa = waLink(`Hi AutoSell Ghana! I'm following up on my listing #${input.submissionId} (${input.title}).`);

  const html = shell(
    "Listing update",
    `About your ${safeTitle}`,
    `
    <p style="margin:0 0 12px;color:#1A1F2E;font:500 15px system-ui">${greeting(input.sellerName)}</p>
    <p style="margin:0 0 12px;color:#4B5563;font:400 14px system-ui;line-height:1.6">
      Thanks for submitting your <b>${safeTitle}</b> to AutoSell Ghana. Unfortunately we couldn't
      publish it as submitted — this is usually because of missing photos, unclear pricing, or
      details we need to confirm.
    </p>
    <p style="margin:0 0 12px;color:#4B5563;font:400 14px system-ui;line-height:1.6">
      It's usually a quick fix. Message us on WhatsApp and we'll help you get your listing live.
    </p>
    ${button(wa, "Chat with us on WhatsApp →", "#25D366")}`
  );

  const text = [
    `${greeting(input.sellerName).replace(/&#?\w+;/g, "")}`,
    "",
    `Thanks for submitting your ${input.title} to AutoSell Ghana. Unfortunately we couldn't publish it as submitted — this is usually because of missing photos, unclear pricing, or details we need to confirm.`,
    "",
    `It's usually a quick fix. Message us on WhatsApp and we'll help you get your listing live: ${wa}`,
    "",
    "— AutoSell Ghana",
  ].join("\n");

  return { subject: `Update on your ${input.title} listing — AutoSell Ghana`, html, text };
}

export async function notifySellerStatusChange(input: SellerStatusNotificationInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = input.sellerEmail?.trim();
  if (!apiKey || !to) return;

  let email: { subject: string; html: string; text: string };
  if (input.newStatus === "completed") {
    email = buildLiveEmail(input);
  } else if (input.newStatus === "rejected") {
    email = buildRejectedEmail(input);
  } else {
    return; // other statuses (contacted/archived) don't notify the seller
  }

  const from =
    process.env.NOTIFY_EMAIL_FROM?.trim() || "AutoSell Ghana <onboarding@resend.dev>";

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({ from, to, subject: email.subject, html: email.html, text: email.text });
  } catch (err) {
    console.error("[notify-seller-email] Failed to send seller notification", err);
  }
}
