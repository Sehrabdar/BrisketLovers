import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { MenuService } from './menu.service';
import { MenuListParamsDto } from './dto/menu-list-params.dto';
import { MenuListDto } from './dto/menu-list.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({
    summary: 'Get paginated, searchable, and sortable list of dishes',
  })
  @ApiResponse({
    status: 200,
    type: MenuListDto,
    isArray: true,
  })
  async findAll(@Query() queryParams: MenuListParamsDto): Promise<MenuListDto> {
    return await this.menuService.findAllDishes(queryParams);
  }
}
