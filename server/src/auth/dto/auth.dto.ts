import { IsEmail, IsString } from 'class-validator';

export class LoginAuthDto {
  @IsEmail()
  login: string;

  @IsString()
  password: string;
}

export class RegisterAuthDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsString()
  login: string;

  @IsString()
  password: string;
}
