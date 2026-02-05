import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { IsNull, Repository } from 'typeorm';
import { UserMapper } from './mapper/user.mapper';
import { LoginDto } from '../core/dto/login.dto';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import { CryptoService } from '../core/crypto/crypto.service';
import { AccountStatus, UserType } from '../core/global.constraints';
import { AuthService } from '../core/auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userMapper: UserMapper,
    private readonly cryptoService: CryptoService,
    private readonly authService: AuthService,
  ) {}
  async create(registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: registerUserDto.email,
        deletedAt: IsNull(),
      },
    });
    if (existingUser) {
      throw new ConflictException(
        `User with ${registerUserDto.email} email already exists.`,
      );
    }
    const user = this.userMapper.toPersistence(registerUserDto);
    const userResponse = await this.userRepository.save(user);
    return this.userMapper.toResponse(userResponse);
  }

  public async login(body: LoginDto): Promise<UserLoginResponseDto> {
    try {
      let user = await this.userRepository.findOne({
        where: { email: body.email },
      });
      if (!user) {
        throw new BadRequestException('Invalid Email or Password');
      }

      if (!(await this.cryptoService.isMatch(body.password, user.password))) {
        throw new BadRequestException('Invalid email or password');
      }

      if (user.status === AccountStatus.Blacklist) {
        throw new BadRequestException(
          `Admin has blacklisted ${body.email}, please contact administrator`,
        );
      }

      return {
        user: this.userMapper.toResponse({ ...user }),
        ...(await this.authService.getAccessToken({
          user: user,
          userType: UserType.AppUser,
        })),
      };
    } catch (error) {
      console.error(`Login failed due to an error: ${error}`);
      throw error;
    }
  }

  async findOne(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.findOneBy({id:id});
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return this.userMapper.toResponse({ ...user });
    } catch (error) {
      console.error(`Failed to load the profile due to the error: ${error}`);
      throw new error;
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
