"use client";

import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from "@/app/_shadcn/components/ui/navigation-menu";

export default function AccountNav() {
  const { dict } = useContext(LocaleContext);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <Link label={dict.labels.profile} href="/account/profile" />
        <Link
          label={dict.labels.languageSettings}
          href="/account/language-settings"
        />
        <Link
          label={dict.labels.changePassword}
          href="/account/change-password"
        />
        <Link
          label={dict.labels.deleteAccount}
          href="/account/delete-account"
        />
      </NavigationMenuList>
    </NavigationMenu>
  );
}

interface LinkProps {
  href: string;
  label: string;
}

function Link({ href, label }: LinkProps) {
  const pathname = usePathname();

  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        asChild
        active={pathname.startsWith(href)}
        data-active={pathname.startsWith(href)}
        className="text-base data-[active=true]:border-b data-[active=true]:border-accent-foreground"
      >
        <NextLink href={href}>{label}</NextLink>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}
