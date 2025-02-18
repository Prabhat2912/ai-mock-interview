"use client";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen justify-center items-center">
        {children}
      </body>
    </html>
  );
}
