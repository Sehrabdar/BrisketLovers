import { Injectable } from '@nestjs/common';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { MenuEntity } from '../entities/menu.entity';
import { MenuResponseDto } from '../dto/menu-response.dto';


@Injectable()
export class MenuMapper {
    toPersistence(menuDto: any): MenuEntity {
        const data = instanceToPlain(menuDto);
        const dish = plainToClass(MenuEntity, data);
        return dish;
    }

    toResponse(data: any): MenuResponseDto {
        const d = instanceToPlain(data);
        const response = plainToClass(MenuResponseDto, d, { excludeExtraneousValues: true });
        return response;
    }

    toArrayResponse(data: any): MenuResponseDto[] {
        return data.map((item: any) => {
            const d = instanceToPlain(item);
            return plainToClass(MenuResponseDto, d, { excludeExtraneousValues: true });
        });
    }

    // toFullResponse(data: any): UserFullResponseDto {
    //     const d = instanceToPlain(data);
    //     const response = plainToClass(UserFullResponseDto, d, { excludeExtraneousValues: true });
    //     return response;
    // }
}
