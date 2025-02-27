import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

// Suppress hydration warnings for known mismatches (optional, use with caution)

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
