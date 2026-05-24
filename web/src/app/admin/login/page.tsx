import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isAdminLoginConfigured } from "@/lib/admin-config";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLoginForm configured={isAdminLoginConfigured()} />;
}
