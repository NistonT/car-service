import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { Response } from 'express';
import { UserService } from '../user/user.service';
import { LoginAuthDto, RegisterAuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  public EXPIRE_DAY_REFRESH_TOKEN = 1;
  public REFRESH_TOKEN_NAME = 'refreshToken';

  constructor(
    private jwt: JwtService,
    private userService: UserService,
  ) {}

  private async validateUser(dto: LoginAuthDto) {
    const user = await this.userService.getByLogin(dto.login);

    const isValid = await verify(user.password, dto.password);

    if (!isValid) throw new UnauthorizedException('Неверный пароль');

    return user;
  }

  private issueToken(userId: number) {
    const data = { id: userId };

    const accessToken = this.jwt.sign(data, { expiresIn: '1h' });

    const refreshToken = this.jwt.sign(data, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  public async login(dto: LoginAuthDto) {
    const { password, ...user } = await this.validateUser(dto);
    const tokens = this.issueToken(user.id);

    return {
      user,
      ...tokens,
    };
  }

  public async register(dto: RegisterAuthDto) {
    const { password, ...user } = await this.userService.create(dto);
    const tokens = this.issueToken(user.id);

    if (!user) throw new UnauthorizedException('Пользователь не создан');

    return {
      user,
      ...tokens,
    };
  }

  public async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken);

    if (!result) throw new UnauthorizedException('Токен не валидный');

    const { password, ...user } = await this.userService.getById(result.id);

    const tokens = this.issueToken(user.id);

    return {
      user,
      ...tokens,
    };
  }

  public addRefreshToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: process.env.DOMAIN,
      expires: expiresIn,
      secure: true,
      sameSite: 'lax',
    });
  }

  public removeRefreshTokenToResponse(res: Response) {
    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      domain: process.env.DOMAIN,
      expires: new Date(0),
      secure: true,
      sameSite: 'lax',
    });
  }
}
