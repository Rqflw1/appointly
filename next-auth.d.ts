import "next-auth";
import { UserRole } from "@/app/_prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: UserRole;
      email?: string | null;
    };
  }
}
