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
import { Invitation, UserAccessLevel } from "@/app/_prisma/browser";
import {
  changeInvitationRoleAction,
  deleteInvitationAction
} from "@/app/_lib/serverActions/invitation";
import EditInvitationDialog from "./EditInvitationDialog";
import RowActions from "../table/RowActions";
import ConfirmActionDialog from "../general/ConfirmActionDialog";

interface ComponentProps {
  row: Row<Invitation>;
}

export default function InvitaitionRowActions({ row }: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  async function changeRole(role: UserAccessLevel) {
    const res = await changeInvitationRoleAction(row.original.id, role);

    if (res.ok) toastHelper.success(dict);
    else toastHelper.error(dict);
  }

  async function deleteRow() {
    const res = await deleteInvitationAction(row.original.id);

    if (res.ok) toastHelper.success(dict);
    else toastHelper.error(dict);
    setIsDeleteOpen(false);
  }

  return (
    <>
      <RowActions>
        <DropdownMenuContent align="end" className="">
          <DropdownMenuSub>
            <DropdownMenuItem
              onClick={() => setTimeout(() => setIsOpen(true), 0)}
            >
              {dict.labels.edit}
            </DropdownMenuItem>
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
            onClick={() => setTimeout(() => setIsDeleteOpen(true), 0)}
          >
            {dict.labels.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </RowActions>
      <EditInvitationDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        invitation={row.original}
      />
      <ConfirmActionDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        description={dict.labels.permanentlyDelete}
        confirmText={dict.labels.delete}
        onConfirm={deleteRow}
      />
    </>
  );
}
