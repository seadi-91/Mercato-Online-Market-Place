import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
