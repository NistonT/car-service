import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { hash } from 'argon2';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto, PutUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  public async create(dto: CreateUserDto): Promise<User> {
    return await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        password: await hash(dto.password),
        phone: dto.phone,
        login: dto.login,
        id_role: 1,
      },
      include: {
        role: true,
      },
    });
  }

  public async getByAll(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  public async getById(id: number) {
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  public async getByLogin(login: string) {
    return await this.prisma.user.findUnique({
      where: {
        login,
      },
    });
  }

  public async getByNumber(phone: string) {
    return await this.prisma.user.findUnique({
      where: {
        phone,
      },
    });
  }

  public async put(dto: PutUserDto, id: number): Promise<User> {
    const { password, ...data } = dto;

    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...data,
        password: await hash(password),
      },
    });
  }

  public async delete(id: number): Promise<User> {
    return await this.prisma.user.delete({
      where: {
        id,
      },
    });
  }
}
