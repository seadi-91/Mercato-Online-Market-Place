import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  identifier?: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  rememberMe?: boolean;
}
