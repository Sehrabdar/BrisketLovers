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
    AppUser = 'AppUser'
}

export enum TokenType {
    Access = 'ACCESS',
    Verify = 'VERIFY'
}