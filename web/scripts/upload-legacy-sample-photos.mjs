/**
 * Upload legacy "Car Photos" → bucket car-photos/legacy-sample/… and attach public URLs on seeded rows.
 *
 * Prerequisites: seeded rows exist (migrate or legacy-sample-seed).
 *
 * Folder: web/public/Car Photos/… (same as legacy script.js), or LEGACY_CAR_PHOTOS_ROOT.
 *
 * From web/: npm run legacy-sample-upload-photos [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";
import {
  defaultPhotoRoots,
  syncLegacyPhotosToStorage,
} from "./legacy-sample-storage.mjs";

async function main() {
  const dry = process.argv.includes("--dry-run");

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    "";

  if (!dry && (!url || !key)) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (or pass --dry-run)"
    );
    process.exit(1);
  }

  const roots = defaultPhotoRoots();
  console.log(`Looking for legacy images:\n${roots.map((r) => `  - ${r}`).join("\n")}`);

  const client = dry
    ? createClient("https://example.supabase.co", "dry-run-key")
    : createClient(url, key);

  const stats = await syncLegacyPhotosToStorage(client, dry ? url : url, roots, dry);

  if (!dry) {
    console.log(`Uploaded ${stats.uploads} objects. Updated ${stats.updated} listings in DB.`);
  } else {
    console.log(
      `[dry-run] Listings ready to patch: ${stats.updated}; skipped (no disk files): ${stats.skippedListings.length}`
    );
  }

  if (stats.skippedListings.length) {
    console.warn("Skipped listings (missing at least one file):");
    stats.skippedListings.slice(0, 24).forEach((s) => console.warn(`  - ${s}`));
    if (stats.skippedListings.length > 24)
      console.warn(`  … and ${stats.skippedListings.length - 24} more`);
  }

  if (stats.errors.length) {
    console.error("Errors:");
    stats.errors.forEach((e) => console.error(`  ${e}`));
    process.exit(1);
  }

  if (!dry && stats.uploads === 0 && stats.updated === 0 && stats.skippedListings.length === 0) {
    console.warn(
      "Nothing to sync — ensure Car Photos is under web/public/ or LEGACY_CAR_PHOTOS_ROOT."
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
