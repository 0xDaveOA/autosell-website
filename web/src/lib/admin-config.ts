/** Server-only: whether admin login env is present (no secrets exposed). */
export function isAdminLoginConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim() && process.env.ADMIN_JWT_SECRET?.trim());
}
