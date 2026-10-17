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

  @MessagePattern('set_user_role_and_status')
  setUserRoleAndStatus(
    @Payload() payload: { userId: string; role?: any; isActive?: boolean },
  ) {
    return this.authService.setUserRoleAndStatus(payload);
  }

  @MessagePattern('delete_user')
  deleteUser(@Payload() payload: { userId: string }) {
    return this.authService.deleteUser(payload.userId);
  }

  @MessagePattern('get_user_by_id')
  getUserById(@Payload() payload: { userId: string }) {
    return this.authService.getUserById(payload.userId);
  }

  @MessagePattern('reset_user_lockout')
  resetUserLockout(@Payload() payload: { userId: string }) {
    return this.authService.resetUserLockout(payload.userId);
  }

  @MessagePattern('get_users_security_info')
  getUsersSecurityInfo(@Payload() payload: { userIds: string[] }) {
    return this.authService.getUsersSecurityInfo(payload.userIds);
  }

  @MessagePattern('google_login')
  googleLogin(@Payload() payload: any) {
    return this.authService.googleLogin(payload);
  }

  @MessagePattern('forgot_password')
  forgotPassword(@Payload() payload: any) {
    return this.authService.forgotPassword(payload);
  }

  @MessagePattern('verify_otp')
  verifyOtp(@Payload() payload: any) {
    return this.authService.verifyOtp(payload);
  }

  @MessagePattern('reset_password_with_otp')
  resetPasswordWithOtp(@Payload() payload: any) {
    return this.authService.resetPasswordWithOtp(payload);
  }
}
