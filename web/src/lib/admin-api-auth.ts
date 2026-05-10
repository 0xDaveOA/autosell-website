import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-session";

export async function assertAdminCookie(): Promise<void> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifyAdminToken(token))) {
    throw new AdminApiAuthError(401, "Unauthorized");
  }
}

export class AdminApiAuthError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "AdminApiAuthError";
  }
}
