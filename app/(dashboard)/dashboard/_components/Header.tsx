"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { options } from "@/Data/data";
import { navLinks } from "@/types/types";

const Header = () => {
  const pathname = usePathname();
  return (
    <div className="flex p-4 bg-gray-200 shadow-md drop-shadow-md justify-between items-center">
      <Image
        src="/logo.svg"
        className="cursor-pointer"
        onClick={() => {
          window.location.href = "/";
        }}
        alt="logo"
        width={40}
        height={40}
      />
      <div className="flex max-md:hidden space-x-6">
        {options.map((option: navLinks) => (
          <Link
            prefetch
            href={option.path}
            key={option.id}
            className={`${
              pathname === option.path ? "text-primary" : ""
            } cursor-pointer font-medium hover:text-primary transition-all duration-300 ease-in-out hover:scale-110 `}
          >
            {option.name}
          </Link>
        ))}
      </div>
      <div className="flex gap-4">
        <UserButton />
      </div>
    </div>
  );
};

export default Header;
