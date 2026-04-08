"use client";

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/app/_shadcn/components/ui/dropdown-menu";
import { useContext, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { Row } from "@tanstack/react-table";
import { roles, toastHelper } from "@/app/_lib/constants/general";
import { UserWithRole } from "@/app/_lib/types/user";
import { UserAccessLevel } from "@/app/_prisma/enums";
import {
  changeRoleAction,
  revokeAccessAction
} from "@/app/_lib/serverActions/user";
import RowActions from "../table/RowActions";
import ConfirmActionDialog from "../general/ConfirmActionDialog";

interface ComponentProps {
  row: Row<UserWithRole>;
}

export default function UserRowActions({ row }: ComponentProps) {
  const { dict } = useContext(LocaleContext);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);

  async function changeRole(role: UserAccessLevel) {
    const res = await changeRoleAction(row.original.id, role);

    if (res.ok) toastHelper.success(dict);
    else toastHelper.error(dict);
  }

  async function revokeAccess() {
    const res = await revokeAccessAction(row.original.id);

    if (res.ok) toastHelper.success(dict);
    else toastHelper.error(dict);
    setIsRevokeOpen(false);
  }

  return (
    <>
      <RowActions>
        <DropdownMenuContent align="end">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <div className="mr-4">{dict.labels.changeRoleTo}</div>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {roles.map((role, key) => (
                <DropdownMenuItem key={key} onClick={() => changeRole(role)}>
                  {dict.userAccessLevel[role]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setTimeout(() => setIsRevokeOpen(true), 0)}
          >
            {dict.labels.revokeAccess}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </RowActions>
      <ConfirmActionDialog
        isOpen={isRevokeOpen}
        onOpenChange={setIsRevokeOpen}
        description={dict.labels.permanentlyRevokeAccess}
        confirmText={dict.labels.revokeAccess}
        onConfirm={revokeAccess}
      />
    </>
  );
}
