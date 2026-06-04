export enum AccountStatus {
  InActive = 'IN_ACTIVE',
  Active = 'ACTIVE',
  Deactivated = 'DEACTIVATED',
  Blacklist = 'BLACKLIST',
  Deleted = 'DELETED_ACCOUNT',
}

export enum CharacterSet {
  UppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  LowercaseLetters = 'abcdefghijklmnopqrstuvwxyz',
  UppercaseAlphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  LowercaseAlphanumeric = 'abcdefghijklmnopqrstuvwxyz0123456789',
  MixedCaseAlphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
}

export enum UserType {
  AppUser = 'AppUser',
}

export enum TokenType {
  Access = 'ACCESS',
  Verify = 'VERIFY',
  Refresh = 'REFRESH',
}

export enum Role {
  CUSTOMER = 'CUSTOMER',
  SUPERADMIN = 'SUPERADMIN',
  STAFF = 'STAFF',
}

export enum OrderDirection {
  Asc = 'ASC',
  Desc = 'DESC',
}

export enum Category {
  STARTER = 'starter',
  MAIN_COURSE = 'main_course',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
}

export enum MenuOrderBy {
  CreatedAt = 'createdAt',
  UpdatedAt = 'updatedAt',
  Name = 'name',
}

export enum Availability {
  True = 'TRUE',
  False = 'FALSE',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
