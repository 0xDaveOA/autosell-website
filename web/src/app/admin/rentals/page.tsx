import { AdminRentalsDashboard } from "@/components/admin/AdminRentalsDashboard";

export const metadata = {
  title: "Admin — Rentals",
  robots: { index: false, follow: false },
};

export default function AdminRentalsPage() {
  return <AdminRentalsDashboard />;
}
