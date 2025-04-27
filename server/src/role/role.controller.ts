import {
  Body,
  Controller,
  Delete,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/role.dto';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @UsePipes(new ValidationPipe())
  @Post()
  public async add(@Body() dto: CreateRoleDto) {
    return await this.roleService.add(dto);
  }

  @Delete()
  public async delete(@Query('id') id: number) {
    return await this.roleService.delete(id);
  }
}
