import { Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuListParamsDto } from './dto/menu-list-params.dto';
import { MenuListDto } from './dto/menu-list.dto';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuEntity } from './entities/menu.entity';
import { Availability } from 'src/core/global.constraints';
import { MenuMapper } from './mapper/menu.mapper';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuEntity)
    private readonly menuRepository: Repository<MenuEntity>,
    private readonly menuMapper: MenuMapper,
  ) {}
  // create(createMenuDto: CreateMenuDto) {
  //   return 'This action adds a new menu';
  // }

  public async findAllDishes(params: MenuListParamsDto): Promise<MenuListDto> {
    const whereCondition: FindOptionsWhere<MenuEntity> = {};
    if (params.query) {
      whereCondition.name = ILike(`%${params.query}%`);
    }

    if (params.available) {
      whereCondition.available = params.available === Availability.True;
    }

    const [dishes, count] = await this.menuRepository.findAndCount({
      where: whereCondition,
      order: {
        [params.orderBy]: params.orderDirection,
      },
      take: params.limit,
      skip: params.offset,
    });
    const allDishes = this.menuMapper.toArrayResponse(dishes);

    return {
      dishes: allDishes,
      count,
    };
  }
}
