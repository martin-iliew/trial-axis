export const UserRole = {
  Admin: "Admin",
  Customer: "Customer",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

/** Permissions that can be checked on the frontend for UI purposes */
export const Permission = {
  ViewUsers: "ViewUsers",
  ManageUsers: "ManageUsers",
} as const;

export type Permission = typeof Permission[keyof typeof Permission];

/** Which permissions each role has — mirrors backend authorization */
export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.Admin]: [
    Permission.ViewUsers,
    Permission.ManageUsers,
  ],
  [UserRole.Customer]: [],
};
