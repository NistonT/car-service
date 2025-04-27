import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateRoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  public async add(dto: CreateRoleDto) {
    const role = await this.prisma.role.create({
      data: {
        code: dto.code,
        name: dto.name,
      },
    });

    return role;
  }

  public async delete(id: number) {
    const role = await this.prisma.role.delete({
      where: {
        id,
      },
    });

    return role;
  }
}
