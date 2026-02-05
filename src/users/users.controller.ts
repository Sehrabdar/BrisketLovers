import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginDto } from 'src/core/dto/login.dto';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import { JwtAuthGuard } from '../core/guards/access-token.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Create users' })
  @ApiResponse({
    status: 201,
    type: UserResponseDto,
  })
  create(@Body() registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
    return this.usersService.create(registerUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'This endpoint is used to login a customer' })
  @ApiResponse({
    status: 200,
    type: UserLoginResponseDto,
  })
  async login(@Body() body: LoginDto): Promise<UserLoginResponseDto> {
    const response = await this.usersService.login({ ...body });
    return response;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'This endpoint is used to get profile details of customer',
  })
  @ApiResponse({
    status: 200,
    type: UserResponseDto,
  })
  @ApiBearerAuth('access-token')
  async findOne(@Request() req): Promise<UserResponseDto> {
    return await this.usersService.findOne(req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
