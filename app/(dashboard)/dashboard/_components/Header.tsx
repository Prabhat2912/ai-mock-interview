"use client";
import Link from "next/link";
import React, { useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { options } from "@/Data/data";
import { navLinks } from "@/types/types";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const Header = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-stage-line bg-stage text-paper">
      <div className="container-x">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center bg-marquee font-display text-lg font-bold text-stage">
              AI
            </span>
            <span className="font-display text-xl font-semibold uppercase leading-none tracking-[0.12em]">
              Interviewai
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
            {options.map((option: navLinks) => {
              const active =
                option.path === "/dashboard"
                  ? pathname?.startsWith("/dashboard")
                  : pathname === option.path;
              return (
                <Link
                  prefetch
                  href={option.path}
                  key={option.id}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-sm font-semibold uppercase tracking-[0.12em] transition-colors",
                    active
                      ? "text-marquee-bright"
                      : "text-paper/70 hover:text-paper"
                  )}
                >
                  {option.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <SignedOut>
              <Link
                href="/dashboard"
                className="btn-marquee hidden !px-5 !py-2.5 sm:inline-flex"
              >
                Take the stage
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="btn-marquee hidden !px-5 !py-2.5 sm:inline-flex"
              >
                Callboard
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-stage-line">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: {
                        height: "2.25rem",
                        width: "2.25rem",
                        borderRadius: "9999px",
                      },
                    },
                  }}
                />
              </span>
            </SignedIn>

            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="grid h-10 w-10 place-items-center border border-stage-line text-paper md:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Mobile"
          className="border-t border-stage-line bg-stage md:hidden"
        >
          <div className="container-x flex flex-col py-3">
            {options.map((option: navLinks) => (
              <Link
                key={option.id}
                href={option.path}
                className="border-b border-stage-line/60 py-3.5 font-display text-lg font-semibold uppercase tracking-[0.12em] text-paper/80 last:border-0 hover:text-paper"
              >
                {option.name}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="btn-marquee mb-3 mt-2 w-full"
            >
              Take the stage
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
