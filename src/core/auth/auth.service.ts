import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidV4 } from 'uuid';

import { EncodeDataArgs, TokenResponse } from './auth.type';
import { TokenType } from '../global.constraints';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    public getAccessToken(data: EncodeDataArgs): TokenResponse {
        const id = uuidV4();
        const tokenType = data.tokenType;
        const secret = this.configService.get('jwt.jwtAccessSecret');
        const expiresInKey = tokenType === TokenType.Verify ? 'jwt.jwtVerifyExpiresIn' : 'jwt.jwtAccessExpiresIn';
        const expiresIn = this.configService.get(expiresInKey);
        console.log('hehehe', secret);
        console.log('hahaha', expiresIn);

        // Validate that both secret and expiresIn are defined
        if (!secret || !expiresIn) {
            throw new Error('Invalid JWT configuration: Secret or expiresIn is missing');
        }

        const accessToken = this.jwtService.sign(
            {
                sub: data.user.id,
                email: data.user.email,
                userType: data.userType,
                tokenType,
                id
            },
            {
                secret: secret,
                expiresIn: expiresIn,
            },
        );
        const decodedToken: any = this.jwtService.decode(accessToken);
        if (!decodedToken || !decodedToken.exp) {
            throw new Error('Failed to decode JWT or missing expiration');
        }

        return { accessToken: accessToken, accessTokenExpiresIn: decodedToken.exp };
    }
}
