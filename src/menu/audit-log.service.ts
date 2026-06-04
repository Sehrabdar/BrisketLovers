import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuAuditLogEntity } from './entities/menu-audit-log.entity';
import { AuditAction, Role } from '../core/global.constraints';
import { ListParamDto } from '../core/dto/list-param.dto';
import { MenuAuditListDto } from './dto/menu-audit-response.dto';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(MenuAuditLogEntity)
    private readonly auditLogRepository: Repository<MenuAuditLogEntity>,
  ) {}

  async logChange(
    menuItemId: string,
    action: AuditAction,
    previousData: Record<string, any> | null,
    newData: Record<string, any> | null,
    changedBy: string,
    changedByRole: Role,
  ): Promise<MenuAuditLogEntity> {
    const log = this.auditLogRepository.create({
      menuItemId,
      action,
      previousData,
      newData,
      changedBy,
      changedByRole,
    });
    return await this.auditLogRepository.save(log);
  }

  async getAuditLogs(params: ListParamDto): Promise<MenuAuditListDto> {
    const [logs, count] = await this.auditLogRepository.findAndCount({
      order: { timestamp: params.orderDirection || 'DESC' },
      take: params.limit,
      skip: params.offset,
    });
    return { logs, count };
  }
}
