import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginAuthDto, RegisterAuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly autoService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login')
  public async login(
    @Body() dto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } = await this.autoService.login(dto);
    this.autoService.addRefreshToResponse(res, refreshToken);

    return response;
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('register')
  public async register(
    @Body() dto: RegisterAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } = await this.autoService.register(dto);
    this.autoService.addRefreshToResponse(res, refreshToken);

    return response;
  }

  @HttpCode(200)
  @Post('login/access-token')
  public async getNewTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshTokenFromCookie =
      req.cookies[this.autoService.REFRESH_TOKEN_NAME];

    if (!refreshTokenFromCookie) {
      this.autoService.removeRefreshTokenToResponse(res);
      throw new UnauthorizedException('Токен не передан');
    }

    const { refreshToken, ...response } = await this.autoService.getNewTokens(
      refreshTokenFromCookie,
    );

    this.autoService.addRefreshToResponse(res, refreshToken);

    return response;
  }

  @HttpCode(200)
  @Post('logout')
  public async logout(@Res({ passthrough: true }) res: Response) {
    this.autoService.removeRefreshTokenToResponse(res);
    return true;
  }
}
