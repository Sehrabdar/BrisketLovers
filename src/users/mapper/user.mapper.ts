import { Injectable } from '@nestjs/common';
import { instanceToPlain, plainToClass } from 'class-transformer';

import { UserResponseDto } from '../dto/user-response.dto';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserMapper {
    toPersistence(userDto: any): UserEntity {
        const data = instanceToPlain(userDto);
        const user = plainToClass(UserEntity, data);
        return user;
    }

    toResponse(data: any): UserResponseDto {
        const d = instanceToPlain(data);
        const response = plainToClass(UserResponseDto, d, { excludeExtraneousValues: true });
        return response;
    }
}