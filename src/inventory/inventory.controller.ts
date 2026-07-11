import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../core/guards/access-token.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { Roles } from '../core/decorators/roles.decorator';
import { Role } from '../core/global.constraints';
import { InventoryService } from './services/inventory.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { IngredientResponseDto, InventoryDashboardDto } from './dto/ingredient-response.dto';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN)
@ApiBearerAuth('access-token')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.STAFF)
  @ApiOperation({ summary: 'List all ingredients with stock status (Superadmin only)' })
  @ApiResponse({ status: 200, type: [IngredientResponseDto] })
  async findAll(): Promise<IngredientResponseDto[]> {
    return this.inventoryService.findAll();
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get inventory dashboard summary — low/out of stock counts (Superadmin only)' })
  @ApiResponse({ status: 200, type: InventoryDashboardDto })
  async getDashboard(): Promise<InventoryDashboardDto> {
    return this.inventoryService.getDashboard();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single ingredient by ID (Superadmin only)' })
  @ApiResponse({ status: 200, type: IngredientResponseDto })
  async findOne(@Param('id') id: string): Promise<IngredientResponseDto> {
    return this.inventoryService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new ingredient (Superadmin only)' })
  @ApiResponse({ status: 201, type: IngredientResponseDto })
  async create(@Body() dto: CreateIngredientDto): Promise<IngredientResponseDto> {
    return this.inventoryService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ingredient metadata (Superadmin only)' })
  @ApiResponse({ status: 200, type: IngredientResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateIngredientDto,
  ): Promise<IngredientResponseDto> {
    return this.inventoryService.update(id, dto);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Adjust ingredient stock by delta (Superadmin only)' })
  @ApiResponse({ status: 200, type: IngredientResponseDto })
  async adjustStock(
    @Param('id') id: string,
    @Body() dto: UpdateStockDto,
  ): Promise<IngredientResponseDto> {
    return this.inventoryService.adjustStock(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an ingredient (Superadmin only). Fails if used in recipes.' })
  @ApiResponse({ status: 200 })
  async remove(@Param('id') id: string): Promise<void> {
    return this.inventoryService.remove(id);
  }
}
