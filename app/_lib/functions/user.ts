import { User } from "@/app/_prisma/client";

export function getFullName(user: User) {
  return `${user.name} ${user.surname}`.trim();
}
