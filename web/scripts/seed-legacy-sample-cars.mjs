/**
 * One-time import of legacy index.html script.js sample cars → car_submissions.
 *
 * Prereqs: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (see .env.example)
 *
 * From web/:
 *   npm run legacy-sample-seed
 * Replace prior seed rows + insert fresh:
 *   npm run legacy-sample-seed -- --purge
 * For production photos, prefer: npm run legacy-sample-upload-photos (after copying Car Photos)
 * Or everything: npm run legacy-sample-migrate
 */
import { createClient } from "@supabase/supabase-js";
import {
  buildLegacySeedRows,
  purgeLegacySampleRows,
} from "./legacy-sample-lib.mjs";

async function main() {
  const args = new Set(process.argv.slice(2));
  const purgeFirst = args.has("--purge");
  const dry = args.has("--dry-run");

  const rows = buildLegacySeedRows();
  if (dry) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    "";

  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY)."
    );
    process.exit(1);
  }

  const supabase = createClient(url, key);

  let deleted = 0;
  if (purgeFirst) deleted = await purgeLegacySampleRows(supabase);

  const { data, error } = await supabase
    .from("car_submissions")
    .insert(rows)
    .select("id");

  if (error) {
    console.error("Insert failed:", error.message, error.details, error.hint);
    process.exit(1);
  }

  console.log(
    purgeFirst
      ? `Removed ${deleted} prior legacy seed rows.`
      : "No purge (--purge not passed). Run with --purge to replace a previous seed."
  );
  console.log(
    `Inserted ${data?.length ?? 0} listings. IDs: ${(data ?? []).map((x) => x.id).join(", ")}`
  );
  console.log(
    "\nOptional: npm run legacy-sample-upload-photos — uploads to Supabase Storage and updates listings."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
