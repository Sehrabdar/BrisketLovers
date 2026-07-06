import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuListParamsDto } from './dto/menu-list-params.dto';
import { MenuListDto } from './dto/menu-list.dto';
import { MenuResponseDto } from './dto/menu-response.dto';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuEntity } from './entities/menu.entity';
import { Availability, AuditAction, Role } from '../core/global.constraints';
import { MenuMapper } from './mapper/menu.mapper';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuEntity)
    private readonly menuRepository: Repository<MenuEntity>,
    private readonly menuMapper: MenuMapper,
    private readonly auditLogService: AuditLogService,
  ) {}

  public async create(dto: CreateMenuDto, userId: string, userRole: Role): Promise<MenuResponseDto> {
    const dish = this.menuMapper.toPersistence(dto);
    dish.createdBy = userId;
    dish.updatedBy = userId;
    const saved = await this.menuRepository.save(dish);

    await this.auditLogService.logChange(
      saved.id,
      AuditAction.CREATE,
      null,
      { ...saved },
      userId,
      userRole,
    );

    return this.menuMapper.toResponse(saved);
  }

  public async update(id: string, dto: UpdateMenuDto, userId: string, userRole: Role): Promise<MenuResponseDto> {
    const dish = await this.findOneEntity(id);
    const previousData = { ...dish };

    Object.assign(dish, dto);
    dish.updatedBy = userId;
    const saved = await this.menuRepository.save(dish);

    await this.auditLogService.logChange(
      saved.id,
      AuditAction.UPDATE,
      previousData,
      { ...saved },
      userId,
      userRole,
    );

    return this.menuMapper.toResponse(saved);
  }

  public async toggleAvailability(id: string, userId: string, userRole: Role): Promise<MenuResponseDto> {
    const dish = await this.findOneEntity(id);
    const previousData = { ...dish };

    dish.available = !dish.available;
    dish.updatedBy = userId;
    const saved = await this.menuRepository.save(dish);

    await this.auditLogService.logChange(
      saved.id,
      AuditAction.UPDATE,
      previousData,
      { ...saved },
      userId,
      userRole,
    );

    return this.menuMapper.toResponse(saved);
  }

  public async remove(id: string, userId: string, userRole: Role): Promise<void> {
    const dish = await this.findOneEntity(id);
    const previousData = { ...dish };

    dish.updatedBy = userId;
    await this.menuRepository.save(dish);
    await this.menuRepository.softRemove(dish);

    await this.auditLogService.logChange(
      id,
      AuditAction.DELETE,
      previousData,
      null,
      userId,
      userRole,
    );
  }

  public async findOne(id: string): Promise<MenuResponseDto> {
    const dish = await this.findOneEntity(id);
    return this.menuMapper.toResponse(dish);
  }

  public async findOneEntity(id: string): Promise<MenuEntity> {
    const dish = await this.menuRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!dish) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }
    return dish;
  }

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
        available: 'DESC',
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

  public async updateImageUrl(id: string, imageUrl: string, userId: string, userRole: Role): Promise<MenuResponseDto> {
    const dish = await this.findOneEntity(id);
    const previousData = { ...dish };

    dish.imageUrl = imageUrl;
    dish.updatedBy = userId;
    const saved = await this.menuRepository.save(dish);

    await this.auditLogService.logChange(
      saved.id,
      AuditAction.UPDATE,
      previousData,
      { ...saved },
      userId,
      userRole,
    );

    return this.menuMapper.toResponse(saved);
  }
}
