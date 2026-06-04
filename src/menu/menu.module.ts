import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { MenuMapper } from './mapper/menu.mapper';
import { MenuEntity } from './entities/menu.entity';
import { MenuAuditLogEntity } from './entities/menu-audit-log.entity';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuEntity, MenuAuditLogEntity]),
  ],
  controllers: [MenuController, AuditLogController],
  providers: [MenuService, AuditLogService, MenuMapper],
  exports: [MenuService, AuditLogService],
})
export class MenuModule {}
