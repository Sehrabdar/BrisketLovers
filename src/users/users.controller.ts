import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginDto } from 'src/core/dto/login.dto';
import { UserLoginResponseDto } from './dto/user-login-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('register')
  @ApiOperation({ summary: 'Create users' })
  @ApiResponse({
        status: 201,
        type: UserResponseDto,
    })
  create(@Body() registerUserDto: RegisterUserDto):Promise<UserResponseDto> {
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


  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
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
