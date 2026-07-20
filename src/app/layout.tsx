import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import AppProviders from "./AppProviders";
import ConvexClientProvider from "./ConvexClientProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amik Verifier & Data",
  description:
    "Instant, secure NIN and BVN lookups powered by licensed providers. Fund your wallet, run verifications, and download slips — all in one platform.",
  icons: {
    icon: "/Amik.png",
    apple: "/Amik.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ConvexClientProvider>
          <AppProviders>{children}</AppProviders>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
