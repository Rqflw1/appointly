import { Dictionary } from "@/app/_lib/types/general";
import { Avatar, AvatarFallback } from "@/app/_shadcn/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/app/_shadcn/components/ui/dropdown-menu";
import Link from "next/link";
import SignOutDropdownMenuItem from "../auth/SignOutDropdownMenuItem";
import { User } from "@/app/_prisma/browser";
import { getFullName } from "@/app/_lib/functions/user";

interface ComponentProps {
  dict: Dictionary;
  user: User;
}

export default function UserMenu({ dict, user }: ComponentProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer">
        <Avatar className="size-10">
          <AvatarFallback>
            {`${user.name.at(0) ?? ""}`}
            {`${user.surname.at(0) ?? ""}`}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end">
        <DropdownMenuLabel>
          <div>{getFullName(user)}</div>
          <div className="font-normal text-xs">{user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account/profile">{dict.labels.profile}</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <SignOutDropdownMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
