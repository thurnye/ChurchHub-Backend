export enum Role {
  SUPER_ADMIN = 'super_admin',
  CHURCH_ADMIN = 'church_admin',
  CLERGY = 'clergy',
  LEADER = 'leader',
  MEMBER = 'member',
}

export const ROLE_HIERARCHY = {
  [Role.SUPER_ADMIN]: 5,
  [Role.CHURCH_ADMIN]: 4,
  [Role.CLERGY]: 3,
  [Role.LEADER]: 2,
  [Role.MEMBER]: 1,
};
