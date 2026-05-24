/** Server-only Meta (Facebook Page + Instagram) auto-post configuration. */

export function isMetaAutoPostEnabled(): boolean {
  return process.env.META_AUTO_POST_ENABLED === "true";
}

export function getMetaPageAccessToken(): string | null {
  const t = process.env.META_PAGE_ACCESS_TOKEN?.trim();
  return t || null;
}

export function getMetaPageId(): string | null {
  const id = process.env.META_PAGE_ID?.trim();
  return id || null;
}

export function getMetaIgUserId(): string | null {
  const id = process.env.META_IG_USER_ID?.trim();
  return id || null;
}

export function getMetaGraphVersion(): string {
  return process.env.META_GRAPH_API_VERSION?.trim() || "v21.0";
}

export function isMetaAutoPostConfigured(): boolean {
  return Boolean(isMetaAutoPostEnabled() && getMetaPageAccessToken() && getMetaPageId());
}
