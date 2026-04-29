import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { MenuMapper } from './mapper/menu.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuEntity } from './entities/menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MenuEntity])],
  controllers: [MenuController],
  providers: [MenuService, MenuMapper],
})
export class MenuModule {}
