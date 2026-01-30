import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from './user-response.dto';
import { TokenResponseDto } from '../../core/auth/dto/token-response.dto';

export class UserLoginResponseDto extends TokenResponseDto {
    @ApiProperty({ type: UserResponseDto })
    user: UserResponseDto;
}