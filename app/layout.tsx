import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";
import type { Metadata } from "next";

const domain = process.env.NEXT_PUBLIC_BASE_URL || "";
const title = "Portfolio Website";
const description = "Portfolio Website by Prabhat Kumar";
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
        width: 300,
        height: 300,
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
        width: 300,
        height: 300,
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
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <Toaster richColors />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
