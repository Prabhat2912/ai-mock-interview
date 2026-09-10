import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { clerkAppearance } from "@/lib/clerk-theme";
import "./globals.css";
import type { Metadata } from "next";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
});
const condensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-condensed",
});

const domain = process.env.NEXT_PUBLIC_BASE_URL || "";
const title = "AI Mock Interview";
const description = "AI Mock Interview platform powered by Gemini";
export const metadata: Metadata = {
  title: title,
  description: description,
  metadataBase: new URL("https://gemini-ai-mock-interview.vercel.app"),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: title,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: title,
    description: description,
    url: domain,
    type: "website",
    siteName: title,

    images: [
      {
        url: domain + "/opengraph-image.png",
        width: 100,
        height: 100,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: {
      default: title,
      template: title,
    },
    images: [
      {
        url: domain + "/opengraph-image.png",
        alt: title,
        width: 100,
        height: 100,
      },
    ],
    description: description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" suppressHydrationWarning className={`${barlow.variable} ${condensed.variable}`}>
        <body suppressHydrationWarning className={`${barlow.className} min-h-screen bg-paper text-stage`}>
          <Toaster richColors closeButton position="top-center" />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
