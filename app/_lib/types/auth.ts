import { UserRole } from "@/app/_prisma/enums";

export interface SignInModel {
  email: string;
  password: string;
}

export interface CreateUserModel {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
