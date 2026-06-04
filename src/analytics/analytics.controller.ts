import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsResponseDto } from './dto/analytics-response.dto';
import { JwtAuthGuard } from '../core/guards/access-token.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { Roles } from '../core/decorators/roles.decorator';
import { Role } from '../core/global.constraints';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get dashboard metrics (SUPERADMIN only)' })
  @ApiResponse({ status: 200, type: AnalyticsResponseDto })
  async getDashboard(): Promise<AnalyticsResponseDto> {
    return await this.analyticsService.getDashboardAnalytics();
  }
}
