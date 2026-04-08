"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from "@/app/_shadcn/components/ui/navigation-menu";
import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { usePathname } from "next/navigation";
import { types } from "@/app/_lib/constants/general";

export default function DocumentsNavBar() {
  const { dict } = useContext(LocaleContext);
  const pathname = usePathname();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            active={pathname === "/documents"}
            data-active={pathname === "/documents"}
            className="text-base data-[active=true]:border-b data-[active=true]:border-accent-foreground"
          >
            <Link href="/documents">{dict.labels.all}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {types.map((type, key) => (
          <NavigationMenuItem key={key}>
            <NavigationMenuLink
              asChild
              active={pathname.startsWith(`/documents/${type.toLowerCase()}`)}
              data-active={pathname.startsWith(
                `/documents/${type.toLowerCase()}`
              )}
              className="text-base data-[active=true]:border-b data-[active=true]:border-accent-foreground"
            >
              <Link href={`/documents/${type.toLowerCase()}`}>
                {dict.documentType[type]}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
