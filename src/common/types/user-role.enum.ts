export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  CHURCH_ADMIN = 'church_admin',
  CLERGY = 'clergy',
  LEADER = 'leader',
  MEMBER = 'member',
}

export const ROLE_HIERARCHY = {
  [UserRole.SUPER_ADMIN]: 5,
  [UserRole.CHURCH_ADMIN]: 4,
  [UserRole.CLERGY]: 3,
  [UserRole.LEADER]: 2,
  [UserRole.MEMBER]: 1,
};
