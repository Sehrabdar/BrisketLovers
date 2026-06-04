import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../core/guards/access-token.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { Roles } from '../core/decorators/roles.decorator';
import { Role } from '../core/global.constraints';
import { ListParamDto } from '../core/dto/list-param.dto';
import { MenuAuditListDto } from './dto/menu-audit-response.dto';

@ApiTags('Audit Logs')
@Controller('menu-audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all menu change audit logs (SUPERADMIN only)' })
  @ApiResponse({ status: 200, type: MenuAuditListDto })
  async getLogs(@Query() queryParams: ListParamDto): Promise<MenuAuditListDto> {
    return await this.auditLogService.getAuditLogs(queryParams);
  }
}
