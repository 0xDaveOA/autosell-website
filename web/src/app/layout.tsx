import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { BRAND_LOGO_SRC } from "@/lib/brand";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plus",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://autosellgh.com"),
  title: {
    default: "AutoSell Ghana — Buy & sell cars",
    template: "%s | AutoSell Ghana",
  },
  description:
    "Ghana's trusted marketplace for buying and selling quality cars. Browse verified listings, enquire via WhatsApp through AutoSell, and list your vehicle.",
  keywords: [
    "buy car ghana",
    "sell car ghana",
    "cars accra",
    "cars kumasi",
    "autosell ghana",
  ],
  icons: {
    icon: [{ url: BRAND_LOGO_SRC, type: "image/jpeg", sizes: "any" }],
    apple: [{ url: BRAND_LOGO_SRC, type: "image/jpeg", sizes: "180x180" }],
  },
  openGraph: {
    title: "AutoSell Ghana — Buy & sell cars",
    description: "Browse verified car listings from trusted sellers across Ghana.",
    url: "/",
    siteName: "AutoSell Ghana",
    locale: "en_GH",
    type: "website",
    images: [{ url: BRAND_LOGO_SRC, alt: "AutoSell Ghana" }],
  },
  other: {
    "facebook-domain-verification": "cz740reg2yspdpdmlgj2rprh1ubl9f",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        <style>{`:root { --font-clash: 'Clash Display', sans-serif; }`}</style>
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <Analytics />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
