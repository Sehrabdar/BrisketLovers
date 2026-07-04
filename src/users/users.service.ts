import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { RegisterUserDto } from './dto/create-user.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { IsNull, Repository } from 'typeorm';
import { UserMapper } from './mapper/user.mapper';
import { LoginDto } from '../core/dto/login.dto';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import { CryptoService } from '../core/crypto/crypto.service';
import { AccountStatus, Role, UserType } from '../core/global.constraints';
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
      where: { email: registerUserDto.email, deletedAt: IsNull() },
    });
    if (existingUser) {
      throw new ConflictException(
        `User with ${registerUserDto.email} email already exists.`,
      );
    }
    const user = this.userMapper.toPersistence(registerUserDto);
    user.role = Role.CUSTOMER;
    const userResponse = await this.userRepository.save(user);
    return this.userMapper.toResponse(userResponse);
  }

  public async login(body: LoginDto): Promise<UserLoginResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: body.email },
    });
    if (!user) {
      throw new BadRequestException('Invalid Email or Password');
    }
    if (user.status === AccountStatus.Deactivated) {
      throw new BadRequestException('Account has been deactivated. Contact admin.');
    }
    if (!(await this.cryptoService.isMatch(body.password, user.password))) {
      throw new BadRequestException('Invalid email or password');
    }
    return {
      user: this.userMapper.toResponse({ ...user }),
      ...this.authService.getTokens({
        user,
        userType: UserType.AppUser,
      }),
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userMapper.toResponse({ ...user });
  }

  async findOneEntity(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email, deletedAt: IsNull() } });
  }

  // ── Staff Management (SUPERADMIN only) ──

  async createStaff(dto: CreateStaffDto): Promise<UserResponseDto> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`User with ${dto.email} already exists.`);
    }
    const user = this.userMapper.toPersistence(dto);
    user.role = Role.STAFF;
    const saved = await this.userRepository.save(user);
    return this.userMapper.toResponse(saved);
  }

  async updateStaff(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findOneEntity(id);
    if (user.role !== Role.STAFF) {
      throw new BadRequestException('User is not a staff member');
    }
    Object.assign(user, dto);
    const saved = await this.userRepository.save(user);
    return this.userMapper.toResponse(saved);
  }

  async disableStaff(id: string): Promise<UserResponseDto> {
    const user = await this.findOneEntity(id);
    if (user.role !== Role.STAFF) {
      throw new BadRequestException('User is not a staff member');
    }
    user.status = AccountStatus.Deactivated;
    const saved = await this.userRepository.save(user);
    return this.userMapper.toResponse(saved);
  }

  async listStaff(): Promise<UserResponseDto[]> {
    const staff = await this.userRepository.find({
      where: { role: Role.STAFF, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    return staff.map((s) => this.userMapper.toResponse(s));
  }

  async updateProfile(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findOneEntity(id);
    if (dto.name) user.name = dto.name;
    if (dto.phone) user.phone = dto.phone;
    if (dto.email) user.email = dto.email;
    const saved = await this.userRepository.save(user);
    return this.userMapper.toResponse(saved);
  }

  async countByRole(role: Role): Promise<number> {
    return this.userRepository.count({
      where: { role, status: AccountStatus.Active, deletedAt: IsNull() },
    });
  }
}
