import { RentalPartnerSignupWizard } from "@/components/rentals/RentalPartnerSignupWizard";

export const metadata = {
  title: "List your rental fleet",
  description:
    "Partner with AutoSell Ghana — list your rental fleet with guided steps, photo uploads, and submission for team review.",
};

export default function RentWithUsPage() {
  return <RentalPartnerSignupWizard />;
}
