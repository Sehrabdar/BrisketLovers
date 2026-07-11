import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/create-user.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginDto } from '../core/dto/login.dto';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import { JwtAuthGuard } from '../core/guards/access-token.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { Roles } from '../core/decorators/roles.decorator';
import { CurrentUser } from '../core/decorators/current-user.decorator';
import { Role } from '../core/global.constraints';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  create(@Body() registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
    return this.usersService.create(registerUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login (customer, staff, or superadmin)' })
  @ApiResponse({ status: 200, type: UserLoginResponseDto })
  async login(@Body() body: LoginDto): Promise<UserLoginResponseDto> {
    return this.usersService.login(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiBearerAuth('access-token')
  async getProfile(@CurrentUser('id') userId: string): Promise<UserResponseDto> {
    return this.usersService.findOne(userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update own profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiBearerAuth('access-token')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create a staff account (SUPERADMIN only)' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiBearerAuth('access-token')
  async createStaff(@Body() dto: CreateStaffDto): Promise<UserResponseDto> {
    return this.usersService.createStaff(dto);
  }

  @Get('staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'List all staff (SUPERADMIN only)' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  @ApiBearerAuth('access-token')
  async listStaff(): Promise<UserResponseDto[]> {
    return this.usersService.listStaff();
  }

  @Patch('staff/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update a staff account (SUPERADMIN only)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiBearerAuth('access-token')
  async updateStaff(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateStaff(id, dto);
  }

  @Patch('staff/:id/disable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Disable a staff account (SUPERADMIN only)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiBearerAuth('access-token')
  async disableStaff(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.disableStaff(id);
  }
}
