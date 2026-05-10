/**
 * Purge prior demo rows → insert 14 listings → optionally upload photos to Storage when disk files exist.
 *
 * npm run legacy-sample-migrate [--no-upload]
 */
import { createClient } from "@supabase/supabase-js";
import {
  buildLegacySeedRows,
  purgeLegacySampleRows,
} from "./legacy-sample-lib.mjs";
import {
  defaultPhotoRoots,
  legacyPhotoFilesExistSomewhere,
  syncLegacyPhotosToStorage,
} from "./legacy-sample-storage.mjs";

async function main() {
  const skipUpload =
    process.argv.includes("--no-upload") ||
    process.argv.includes("--skip-upload");

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    "";

  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY."
    );
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const roots = defaultPhotoRoots();

  console.log("[1/2] Purge + seed legacy demos…");
  const deleted = await purgeLegacySampleRows(supabase);
  const rows = buildLegacySeedRows();
  const { data: inserted, error: insErr } = await supabase
    .from("car_submissions")
    .insert(rows)
    .select("id");
  if (insErr) {
    console.error(insErr.message, insErr.details);
    process.exit(1);
  }
  console.log(
    `  Deleted ${deleted} old demo rows. Inserted ${inserted?.length ?? 0} (ids: ${(inserted ?? []).map((r) => r.id).join(", ")})`
  );

  if (skipUpload) {
    console.log(
      "\n[2/2] Skipped uploads (--no-upload). Run npm run legacy-sample-upload-photos when ready."
    );
    return;
  }

  const hasFiles = await legacyPhotoFilesExistSomewhere(roots);
  if (!hasFiles) {
    console.log(
      "\n[2/2] No Car Photos on disk — listings use /Car Photos/ URLs until you run:\n          npm run legacy-sample-upload-photos\n       (after copying folders into web/public/Car Photos/.)"
    );
    return;
  }

  console.log("\n[2/2] Syncing gallery to Supabase Storage (car-photos) …");
  const stats = await syncLegacyPhotosToStorage(supabase, url, roots, false);
  console.log(
    `  Uploaded ${stats.uploads} file(s); updated ${stats.updated} listing(s).`
  );
  if (stats.skippedListings.length) {
    stats.skippedListings.slice(0, 8).forEach((s) =>
      console.warn(`  Missing files (skipped listing): ${s}`)
    );
  }
  if (stats.errors.length) {
    stats.errors.forEach((e) => console.error(`  ${e}`));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
