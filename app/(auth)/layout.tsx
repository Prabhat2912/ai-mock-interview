"use client";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grain relative flex min-h-screen items-center justify-center bg-stage px-4 py-10 text-paper">
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="inline-grid h-11 w-11 place-items-center bg-marquee font-display text-lg font-bold text-stage">
            AI
          </span>
          <p className="mt-3 font-display text-2xl font-semibold uppercase tracking-wide">
            Stage door
          </p>
          <p className="mt-1 text-sm text-paper/60">
            Sign in to take your rehearsal further
          </p>
        </div>
        <div className="flex justify-center [&>div]:w-full [&>div]:max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
