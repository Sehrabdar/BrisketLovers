import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuListParamsDto } from './dto/menu-list-params.dto';
import { MenuListDto } from './dto/menu-list.dto';
import { MenuResponseDto } from './dto/menu-response.dto';
import { JwtAuthGuard } from '../core/guards/access-token.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { Roles } from '../core/decorators/roles.decorator';
import { CurrentUser } from '../core/decorators/current-user.decorator';
import { Role } from '../core/global.constraints';

const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `menu-item-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@ApiTags('Menu')
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
  })
  async findAll(@Query() queryParams: MenuListParamsDto): Promise<MenuListDto> {
    return await this.menuService.findAllDishes(queryParams);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a single menu item' })
  @ApiResponse({ status: 200, type: MenuResponseDto })
  async findOne(@Param('id') id: string): Promise<MenuResponseDto> {
    return await this.menuService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.STAFF)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new menu item (Staff/Superadmin only)' })
  @ApiResponse({ status: 201, type: MenuResponseDto })
  async create(
    @Body() createMenuDto: CreateMenuDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<MenuResponseDto> {
    return await this.menuService.create(createMenuDto, userId, userRole);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.STAFF)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a menu item (Staff/Superadmin only)' })
  @ApiResponse({ status: 200, type: MenuResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateMenuDto: UpdateMenuDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<MenuResponseDto> {
    return await this.menuService.update(id, updateMenuDto, userId, userRole);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.STAFF)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Toggle menu item availability (Staff/Superadmin only)' })
  @ApiResponse({ status: 200, type: MenuResponseDto })
  async toggleAvailability(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<MenuResponseDto> {
    return await this.menuService.toggleAvailability(id, userId, userRole);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.STAFF)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a menu item (Staff/Superadmin only)' })
  @ApiResponse({ status: 204, description: 'Menu item deleted successfully' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<void> {
    await this.menuService.remove(id, userId, userRole);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.STAFF)
  @ApiBearerAuth('access-token')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new BadRequestException('Only image files are allowed (jpg, jpeg, png, webp)!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload an image for a menu item (Staff/Superadmin only)' })
  @ApiResponse({ status: 200, type: MenuResponseDto })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<MenuResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const relativePath = `/uploads/${file.filename}`;
    return await this.menuService.updateImageUrl(id, relativePath, userId, userRole);
  }
}
