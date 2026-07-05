/**
 * Server-only helper that emails AutoSell admins when a new rental partner signs up.
 * Reuses the same RESEND_API_KEY / NOTIFY_EMAIL_TO / NOTIFY_EMAIL_FROM env vars as
 * notify-email.ts. No-ops silently if either is missing.
 */
import { Resend } from "resend";
import type { RentalPartnerInsertInput, RentalVehicleInsertInput } from "@/lib/rental-partner-insert";
import { getSiteUrl } from "@/lib/site-url";

export type RentalPartnerNotificationInput = {
  partner: RentalPartnerInsertInput;
  vehicles: RentalVehicleInsertInput[];
  partnerId: number | null;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildText(input: RentalPartnerNotificationInput): string {
  const lines = [
    `NEW RENTAL PARTNER SIGNUP${input.partnerId ? ` #${input.partnerId}` : ""}`,
    `${input.partner.business_name} — ${input.partner.location}`,
    "",
    `Contact: ${input.partner.contact_name}`,
    `Phone: ${input.partner.contact_phone}`,
    input.partner.contact_email ? `Email: ${input.partner.contact_email}` : "Email: —",
    `WhatsApp: ${input.partner.whatsapp_number || input.partner.contact_phone}`,
    "",
    `Vehicles (${input.vehicles.length}):`,
    ...input.vehicles.map(
      (v) => `- ${v.car_make} ${v.car_model} (${v.year}) — ₵${v.daily_rate}/day, ${v.location}`
    ),
    "",
    `Open admin: ${getSiteUrl()}/admin/rentals`,
  ];
  return lines.join("\n");
}

function buildHtml(input: RentalPartnerNotificationInput): string {
  const vehicleRows = input.vehicles
    .map(
      (v) =>
        `<tr><td style="padding:6px 12px;color:#1A1F2E;font:500 14px system-ui,sans-serif">${escapeHtml(v.car_make)} ${escapeHtml(v.car_model)} (${escapeHtml(v.year)}) — ₵${escapeHtml(String(v.daily_rate))}/day, ${escapeHtml(v.location)}</td></tr>`
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;background:#F4F6F8;padding:24px;font-family:system-ui,-apple-system,Segoe UI,sans-serif">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #E2E6EA">
    <div style="background:#1A1F2E;color:#fff;padding:18px 24px">
      <div style="font:600 13px system-ui;letter-spacing:.08em;color:#E8500A;text-transform:uppercase">New rental partner signup</div>
      <div style="font:700 22px system-ui;margin-top:4px">${escapeHtml(input.partner.business_name)}${input.partnerId ? ` <span style="color:#9CA3AF;font-weight:500">#${input.partnerId}</span>` : ""}</div>
      <div style="color:#9CA3AF;font:500 14px system-ui;margin-top:4px">${escapeHtml(input.partner.location)} · ${input.vehicles.length} vehicle(s)</div>
    </div>
    <div style="padding:20px 24px">
      <table style="border-collapse:collapse;width:100%;background:#F8FAFC;border:1px solid #E2E6EA;border-radius:10px;overflow:hidden">
        <tr><td style="padding:6px 12px;color:#6B7280;font:500 13px system-ui,sans-serif">Contact</td><td style="padding:6px 12px;color:#1A1F2E;font:500 14px system-ui,sans-serif">${escapeHtml(input.partner.contact_name)} · ${escapeHtml(input.partner.contact_phone)}</td></tr>
        ${vehicleRows}
      </table>
      <div style="margin-top:20px;text-align:center">
        <a href="${getSiteUrl()}/admin/rentals" style="display:inline-block;background:#E8500A;color:#fff;text-decoration:none;font:600 14px system-ui;padding:12px 22px;border-radius:10px">Open rentals admin →</a>
      </div>
    </div>
  </div>
</body></html>`;
}

export async function notifyNewRentalPartner(input: RentalPartnerNotificationInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.NOTIFY_EMAIL_TO?.trim();
  if (!apiKey || !to) return;

  const from = process.env.NOTIFY_EMAIL_FROM?.trim() || "AutoSell Ghana <onboarding@resend.dev>";
  const recipients = to
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (recipients.length === 0) return;

  const subject = `New rental partner signup: ${input.partner.business_name} (${input.vehicles.length} vehicles)`;

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
    console.error("[notify-rental-email] Failed to send notification", err);
  }
}
