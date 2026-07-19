import { AdminRentalsDashboard } from "@/components/admin/AdminRentalsDashboard";
import { isMetaAutoPostConfigured } from "@/lib/meta-social-config";

export const metadata = {
  title: "Admin — Rentals",
  robots: { index: false, follow: false },
};

export default function AdminRentalsPage() {
  return <AdminRentalsDashboard metaConfigured={isMetaAutoPostConfigured()} />;
}
