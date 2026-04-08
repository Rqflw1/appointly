"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LogoImage() {
  const { resolvedTheme } = useTheme();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  return (
    <div className="relative w-[212px] h-[38px]">
      {resolvedTheme === "light" && (
        <Image src="/general/logo-dark.svg" alt="Logo" fill priority />
      )}
      {resolvedTheme !== "light" && (
        <Image src="/general/logo-light.svg" alt="Logo" fill priority />
      )}
    </div>
  );
}
