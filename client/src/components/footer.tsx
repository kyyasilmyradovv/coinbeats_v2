"use client";
import * as React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { NAV_ITEMS } from "@/shared/links";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  return (
    <div className="left-0 bottom-0 h-20 border-t fixed w-full bg-background flex items-center justify-between md:justify-around gap-1 md:gap-4 md:px-2">
      {NAV_ITEMS.map((item) => (
        <Link
          href={item.href}
          key={item.label}
          scroll={false}
          className="flex-1"
        >
          <Button
            size={"sm"}
            className={`w-full bg-background cursor-pointer ${
              pathname === item.href ? "border-brand" : ""
            }  flex-col h-fit px-0.5  py-1`}
            variant="outline"
          >
            <div className="relative w-[25px] h-[25px] md:w-[30px] md:h-[30px]">
              <Image
                src={item.icon}
                alt={item.label}
                fill
                className="object-contain"
              />
            </div>
            {item.label}
          </Button>
        </Link>
      ))}
    </div>
  );
}
