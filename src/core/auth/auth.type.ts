import { UserEntity } from '../../users/entities/user.entity';
import { TokenType, UserType } from '../global.constraints';

export type JwtPayload = {
    sub: string;
    email: string;
    userType: UserType;
    tokenType?: TokenType;
    id?: string;
};

export type EncodeDataArgs = {
    user: UserEntity;
    userType: UserType;
    tokenType?: TokenType;
};

export type TokenResponse = {
    accessToken: string;
    accessTokenExpiresIn: number;
};

export type AuthPayload = {
    userId?: string;
    userType: string;
    error: boolean;
};
