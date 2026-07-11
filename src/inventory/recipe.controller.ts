import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../core/guards/access-token.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { Roles } from '../core/decorators/roles.decorator';
import { Role } from '../core/global.constraints';
import { RecipeService } from './services/recipe.service';
import { UpsertRecipeDto } from './dto/upsert-recipe.dto';
import { RecipeResponseDto } from './dto/recipe-ingredient-response.dto';

@ApiTags('Recipes')
@Controller('recipes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.STAFF)
  @ApiOperation({ summary: 'List recipes for all menu items (Staff/Superadmin)' })
  @ApiResponse({ status: 200, type: [RecipeResponseDto] })
  async getAllRecipes(): Promise<RecipeResponseDto[]> {
    return this.recipeService.getAllRecipes();
  }

  @Get(':menuItemId')
  @Roles(Role.SUPERADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Get recipe for a specific menu item (Staff/Superadmin)' })
  @ApiResponse({ status: 200, type: RecipeResponseDto })
  async getRecipe(@Param('menuItemId') menuItemId: string): Promise<RecipeResponseDto> {
    return this.recipeService.getRecipe(menuItemId);
  }

  @Put(':menuItemId')
  @Roles(Role.SUPERADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Upsert full recipe for a menu item — replaces existing (Staff/Superadmin)' })
  @ApiResponse({ status: 200, type: RecipeResponseDto })
  async upsertRecipe(
    @Param('menuItemId') menuItemId: string,
    @Body() dto: UpsertRecipeDto,
  ): Promise<RecipeResponseDto> {
    return this.recipeService.upsertRecipe(menuItemId, dto);
  }

  @Delete(':menuItemId')
  @Roles(Role.SUPERADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Remove all recipe ingredients for a menu item (Staff/Superadmin)' })
  @ApiResponse({ status: 200 })
  async deleteRecipe(@Param('menuItemId') menuItemId: string): Promise<void> {
    return this.recipeService.deleteRecipe(menuItemId);
  }
}
