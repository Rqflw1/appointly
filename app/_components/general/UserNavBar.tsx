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

export default function UserNavBar() {
    const { dict } = useContext(LocaleContext);
    const pathname = usePathname();

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuLink
                        asChild
                        active={pathname.startsWith("/documents")}
                        data-active={pathname.startsWith("/documents")}
                    >
                        <Link href="/documents">{dict.labels.documents}</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink
                        asChild
                        active={pathname.startsWith("/items")}
                        data-active={pathname.startsWith("/items")}
                    >
                        <Link href="/items">{dict.labels.items}</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink
                        asChild
                        active={pathname.startsWith("/partners")}
                        data-active={pathname.startsWith("/partners")}
                    >
                        <Link href="/partners">{dict.labels.partners}</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}
