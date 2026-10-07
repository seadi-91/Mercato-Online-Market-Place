import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @MessagePattern('register')
  register(@Payload() payload: any) {
    return this.authService.register(payload);
  }

  @MessagePattern('login')
  login(@Payload() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @MessagePattern('refresh_token')
  refreshToken(@Payload() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @MessagePattern('logout')
  logout(@Payload() payload: { userId: string }) {
    return this.authService.logout(payload.userId);
  }

  @MessagePattern('change_password')
  changePassword(@Payload() dto: ChangePasswordDto) {
    return this.authService.changePassword(dto);
  }

  @MessagePattern('validate_token')
  validateToken(@Payload() payload: { token: string }) {
    return this.authService.validateToken(payload.token);
  }

  @MessagePattern('set_user_active_status')
  setUserActiveStatus(@Payload() payload: { userId: string; isActive: boolean }) {
    return this.authService.setUserActiveStatus(
      payload.userId,
      payload.isActive,
    );
  }

  @MessagePattern('delete_user')
  deleteUser(@Payload() payload: { userId: string }) {
    return this.authService.deleteUser(payload.userId);
  }
}
