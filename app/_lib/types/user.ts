import { Language, User, UserAccessLevel } from "@/app/_prisma/browser";

export interface UserWithRole extends User {
  role: UserAccessLevel;
}

export interface UpdateUserModel {
  name: string;
  surname: string;
  email: string;
  language: Language;
}

export interface ChangePasswordModel {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteUserModel {
  password: string;
}

export interface RecoverPasswordModel {
  email: string;
  code: string;
  password: string;
}
