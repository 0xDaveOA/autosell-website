/**
 * Upload legacy demo images → Supabase bucket car-photos/legacy-sample/… and patch rows by notes prefix.
 */
import { readFile } from "fs/promises";
import fs from "fs";
import path from "path";

import {
  LEGACY_SAMPLE_ROWS,
  SEED_NOTE_PREFIX,
} from "./legacy-sample-lib.mjs";

export const LEGACY_BUCKET = "car-photos";
export const LEGACY_STORAGE_PREFIX = "legacy-sample";

export function defaultPhotoRoots(cwd = process.cwd()) {
  /** @type {string[]} */
  const out = [];
  const explicit = process.env.LEGACY_CAR_PHOTOS_ROOT?.trim();
  if (explicit) out.push(path.resolve(explicit));
  out.push(path.join(cwd, "public"));
  out.push(cwd);
  return [...new Set(out)];
}

function contentType(ext) {
  const e = ext.toLowerCase();
  if (e === ".jpg" || e === ".jpeg") return "image/jpeg";
  if (e === ".png") return "image/png";
  if (e === ".webp") return "image/webp";
  return "application/octet-stream";
}

async function resolvePublicUrl(client, storagePath, supabaseUrl) {
  const { data } = client.storage.from(LEGACY_BUCKET).getPublicUrl(storagePath);
  if (data?.publicUrl) return data.publicUrl;
  const base =
    typeof supabaseUrl === "string" ? supabaseUrl.replace(/\/$/, "") : "";
  const enc = encodeURI(storagePath);
  return `${base}/storage/v1/object/public/${LEGACY_BUCKET}/${enc}`;
}

/**
 * @typedef {{ uploads: number, updated: number, skippedListings: string[], errors: string[] }} SyncResult
 * @returns {Promise<SyncResult>}
 */
export async function syncLegacyPhotosToStorage(
  supabaseClient,
  supabaseProjectUrl,
  roots,
  dry
) {
  let uploads = 0;
  let updated = 0;
  /** @type {string[]} */
  const skippedListings = [];
  /** @type {string[]} */
  const errors = [];

  for (const row of LEGACY_SAMPLE_ROWS) {
    /** @type {string[]} */
    const urls = [];
    let aborted = false;

    for (let idx = 0; idx < row.images.length; idx++) {
      const rel = row.images[idx];
      const basename = `${String(idx + 1).padStart(2, "0")}${path.extname(rel).toLowerCase() || ".jpg"}`;
      const storagePath = `${LEGACY_STORAGE_PREFIX}/${row.key}/${basename}`;

      const absCandidates = roots.map((r) => path.join(r, ...rel.split("/")));

      /** @type {string | undefined} */
      let found;
      for (const p of absCandidates) {
        if (fs.existsSync(p)) {
          found = p;
          break;
        }
      }

      if (!found) {
        skippedListings.push(`${row.key} (${rel})`);
        aborted = true;
        break;
      }

      try {
        const buf = await readFile(found);
        const ct = contentType(path.extname(found));
        if (!dry) {
          const { error: upErr } = await supabaseClient.storage
            .from(LEGACY_BUCKET)
            .upload(storagePath, buf, {
              contentType: ct,
              upsert: true,
            });
          if (upErr) {
            errors.push(`${storagePath}: ${upErr.message}`);
            aborted = true;
            break;
          }
          uploads += 1;
          urls.push(
            await resolvePublicUrl(supabaseClient, storagePath, supabaseProjectUrl)
          );
        } else {
          urls.push(`${LEGACY_BUCKET}/${storagePath}`);
        }
      } catch (e) {
        errors.push(
          `${found}: ${e instanceof Error ? e.message : String(e)}`
        );
        aborted = true;
        break;
      }
    }

    if (aborted || urls.length !== row.images.length) continue;

    if (dry) {
      updated += 1;
      continue;
    }

    const { error } = await supabaseClient
      .from("car_submissions")
      .update({ photos: urls })
      .eq("notes", `${SEED_NOTE_PREFIX}${row.key}`);

    if (error) errors.push(`${row.key} DB: ${error.message}`);
    else updated += 1;
  }

  return { uploads, updated, skippedListings, errors };
}

export async function legacyPhotoFilesExistSomewhere(
  roots = defaultPhotoRoots()
) {
  for (const row of LEGACY_SAMPLE_ROWS) {
    for (const rel of row.images) {
      for (const r of roots) {
        if (fs.existsSync(path.join(r, ...rel.split("/")))) return true;
      }
    }
  }
  return false;
}
