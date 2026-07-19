import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { isMetaAutoPostConfigured } from "@/lib/meta-social-config";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard metaConfigured={isMetaAutoPostConfigured()} />;
}
