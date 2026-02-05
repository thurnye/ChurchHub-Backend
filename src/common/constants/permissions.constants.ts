import { Role } from './roles.constants';

export enum Permission {
  // Tenant
  CREATE_TENANT = 'create:tenant',
  UPDATE_TENANT = 'update:tenant',
  DELETE_TENANT = 'delete:tenant',
  MANAGE_JOIN_CODES = 'manage:join_codes',
  
  // Users
  MANAGE_USERS = 'manage:users',
  VIEW_USERS = 'view:users',
  
  // Content
  CREATE_POST = 'create:post',
  DELETE_ANY_POST = 'delete:any_post',
  CREATE_EVENT = 'create:event',
  MANAGE_EVENTS = 'manage:events',
  CREATE_SERMON = 'create:sermon',
  MANAGE_SERMONS = 'manage:sermons',
  MANAGE_WORSHIP = 'manage:worship',
  
  // Groups
  CREATE_GROUP = 'create:group',
  MANAGE_GROUPS = 'manage:groups',
  
  // Donations
  VIEW_DONATIONS = 'view:donations',
  MANAGE_DONATIONS = 'manage:donations',
  
  // Settings
  MANAGE_SETTINGS = 'manage:settings',
}

export const ROLE_PERMISSIONS = {
  [Role.SUPER_ADMIN]: Object.values(Permission),
  [Role.CHURCH_ADMIN]: [
    Permission.UPDATE_TENANT,
    Permission.MANAGE_JOIN_CODES,
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.DELETE_ANY_POST,
    Permission.MANAGE_EVENTS,
    Permission.MANAGE_SERMONS,
    Permission.MANAGE_WORSHIP,
    Permission.MANAGE_GROUPS,
    Permission.VIEW_DONATIONS,
    Permission.MANAGE_DONATIONS,
    Permission.MANAGE_SETTINGS,
  ],
  [Role.CLERGY]: [
    Permission.VIEW_USERS,
    Permission.CREATE_EVENT,
    Permission.CREATE_SERMON,
    Permission.MANAGE_WORSHIP,
    Permission.CREATE_GROUP,
  ],
  [Role.LEADER]: [
    Permission.CREATE_POST,
    Permission.CREATE_GROUP,
  ],
  [Role.MEMBER]: [
    Permission.CREATE_POST,
  ],
};
