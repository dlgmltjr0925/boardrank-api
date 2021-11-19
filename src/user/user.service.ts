import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ApiAlreadyRegisteredErrorResponse } from 'libs/http-exceptions/api-has-reference-error-response';
import { ApiNotFoundErrorResponse } from 'libs/http-exceptions/api-not-found-error-response';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from '.prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'src/auth/entities/role';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './vo/user.vo';

@Injectable()
export class UserService {
  static ErrorAlreadyRegistered = new ApiAlreadyRegisteredErrorResponse(
    '이미 등록된 회원입니다.',
  );

  static ErrorNotFound = new ApiNotFoundErrorResponse(
    '해당 유저를 찾을 수 없습니다.',
  );

  constructor(private prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.prismaService.user.create({
        data: createUserDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          /**
           * oauth id가 중복되었을 경우
           */
          throw new ConflictException(UserService.ErrorAlreadyRegistered);
        }
      }
    }
  }

  async findOneById(id: number): Promise<User> {
    try {
      const user = await this.prismaService.user.findUnique({
        select: {
          id: true,
          nickname: true,
          profileUrl: true,
          role: true,
        },
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(UserService.ErrorNotFound);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(
    id: number,
    updateUserDto: UpdateUserDto,
    hasAdminPermission = false,
  ): Promise<User> {
    try {
      if (!hasAdminPermission && updateUserDto.role === Role.ADMIN) {
        throw new ForbiddenException();
      }

      return await this.prismaService.user.update({
        select: {
          id: true,
          nickname: true,
          profileUrl: true,
          role: true,
        },
        data: updateUserDto,
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException(UserService.ErrorNotFound);
      }
      throw error;
    }
  }

  async delete(id: number): Promise<User> {
    try {
      return await this.prismaService.user.delete({
        select: {
          id: true,
          nickname: true,
          profileUrl: true,
          role: true,
        },
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException(UserService.ErrorNotFound);
      }
      throw error;
    }
  }
}
