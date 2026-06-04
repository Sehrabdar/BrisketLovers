import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AuditAction, Role } from '../../core/global.constraints';

export class MenuAuditResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  menuItemId: string;

  @ApiProperty({ enum: AuditAction })
  @Expose()
  action: AuditAction;

  @ApiProperty({ required: false })
  @Expose()
  previousData: Record<string, any>;

  @ApiProperty({ required: false })
  @Expose()
  newData: Record<string, any>;

  @ApiProperty()
  @Expose()
  changedBy: string;

  @ApiProperty({ enum: Role })
  @Expose()
  changedByRole: Role;

  @ApiProperty()
  @Expose()
  timestamp: Date;
}

export class MenuAuditListDto {
  @ApiProperty({ type: [MenuAuditResponseDto] })
  @Expose()
  logs: MenuAuditResponseDto[];

  @ApiProperty()
  @Expose()
  count: number;
}
