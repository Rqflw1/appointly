"use client";

import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import NextLink from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from "@/app/_shadcn/components/ui/navigation-menu";
import { usePathname } from "next/navigation";

export default function SettingsNav() {
  const { dict } = useContext(LocaleContext);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <Link label={dict.labels.profile} href="/company/profile" />
        <Link label={dict.labels.appearance} href="/company/appearance" />
        <Link
          label={dict.labels.documentSettings}
          href="/company/document-settings"
        />
        <Link
          label={dict.labels.emailSettings}
          href="/company/email-settings"
        />
        <Link
          label={dict.labels.paymentMethods}
          href="/company/payment-methods"
        />
        <Link label={dict.labels.users} href="/company/users" />
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
