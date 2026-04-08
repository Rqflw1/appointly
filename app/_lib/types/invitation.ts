import { UserAccessLevel } from "@/app/_prisma/browser";

export interface CreateInvitationModel {
  email: string;
  role: UserAccessLevel;
}
