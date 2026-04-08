import { Permission, UserAccessLevel } from "@/app/_prisma/enums";

interface RolePermission {
  role: UserAccessLevel;
  permissions: Permission[];
}

export const rolePermissions: RolePermission[] = [
  {
    role: UserAccessLevel.OWNER,
    permissions: [
      Permission.DOCUMENT_READ,
      Permission.DOCUMENT_WRITE,
      Permission.COMPANY_SETTINGS_READ,
      Permission.COMPANY_SETTINGS_WRITE,
      Permission.COMPANY_DELETE
    ]
  },
  {
    role: UserAccessLevel.ADMIN,
    permissions: [
      Permission.DOCUMENT_READ,
      Permission.DOCUMENT_WRITE,
      Permission.COMPANY_SETTINGS_READ,
      Permission.COMPANY_SETTINGS_WRITE
    ]
  },
  {
    role: UserAccessLevel.MANAGER,
    permissions: [
      Permission.DOCUMENT_READ,
      Permission.DOCUMENT_WRITE,
      Permission.COMPANY_SETTINGS_READ
    ]
  },
  {
    role: UserAccessLevel.VIEWER,
    permissions: [Permission.DOCUMENT_READ, Permission.COMPANY_SETTINGS_READ]
  }
];
