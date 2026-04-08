"use client";

import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { Tabs, TabsList, TabsTrigger } from "@/app/_shadcn/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import InvitationsTable from "../invitation/InvitationsTable";
import UsersTable from "../user/UsersTable";
import { UserWithRole } from "@/app/_lib/types/user";
import { Invitation } from "@/app/_prisma/browser";

interface ComponentProps {
  users: UserWithRole[];
  invitations: Invitation[];
}

export default function UsersSettings({ users, invitations }: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  return (
    <div>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">{dict.labels.users}</TabsTrigger>
          <TabsTrigger value="invitations">
            {dict.labels.invitations}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersTable users={users} />
        </TabsContent>
        <TabsContent value="invitations">
          <InvitationsTable invitations={invitations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
