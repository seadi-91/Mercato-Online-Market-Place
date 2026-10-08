import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MerchantKycDto } from './dto/merchant-kyc.dto';
import { DeliveryKycDto } from './dto/delivery-kyc.dto';
import {
  CreateAuditLogDto,
  CreateStaffDto,
  FilterAuditLogsDto,
  FilterUsersDto,
  UpdateStaffDto,
} from '@app/common';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('create_profile')
  createProfile(@Payload() payload: any) {
    return this.usersService.createProfile(payload);
  }

  @MessagePattern('get_profile')
  getProfile(@Payload() payload: { userId: string }) {
    return this.usersService.getProfileByUserId(payload.userId);
  }

  @MessagePattern('update_profile')
  updateProfile(
    @Payload() payload: { userId: string; dto: UpdateProfileDto },
  ) {
    return this.usersService.updateProfile(payload.userId, payload.dto);
  }

  @MessagePattern('submit_merchant_kyc')
  submitMerchantKyc(
    @Payload() payload: { userId: string; dto: MerchantKycDto },
  ) {
    return this.usersService.submitMerchantKyc(payload.userId, payload.dto);
  }

  @MessagePattern('submit_delivery_kyc')
  submitDeliveryKyc(
    @Payload() payload: { userId: string; dto: DeliveryKycDto },
  ) {
    return this.usersService.submitDeliveryKyc(payload.userId, payload.dto);
  }

  @MessagePattern('toggle_delivery_availability')
  toggleDeliveryAvailability(
    @Payload() payload: { userId: string; isAvailable: boolean },
  ) {
    return this.usersService.toggleDeliveryAvailability(
      payload.userId,
      payload.isAvailable,
    );
  }

  @MessagePattern('verify_merchant')
  verifyMerchant(
    @Payload()
    payload: {
      userId: string;
      isVerified: boolean;
      rejectionReason?: string;
    },
  ) {
    return payload.rejectionReason !== undefined
      ? this.usersService.verifyMerchant(
          payload.userId,
          payload.isVerified,
          payload.rejectionReason,
        )
      : this.usersService.verifyMerchant(
          payload.userId,
          payload.isVerified,
        );
  }

  @MessagePattern('verify_delivery')
  verifyDelivery(
    @Payload()
    payload: {
      userId: string;
      isVerified: boolean;
      rejectionReason?: string;
    },
  ) {
    return payload.rejectionReason !== undefined
      ? this.usersService.verifyDelivery(
          payload.userId,
          payload.isVerified,
          payload.rejectionReason,
        )
      : this.usersService.verifyDelivery(
          payload.userId,
          payload.isVerified,
        );
  }

  @MessagePattern('set_user_status')
  setUserStatus(@Payload() payload: { userId: string; isActive: boolean }) {
    return this.usersService.setUserStatus(payload.userId, payload.isActive);
  }

  @MessagePattern('delete_user_profile')
  deleteUserProfile(@Payload() payload: { userId: string }) {
    return this.usersService.deleteProfile(payload.userId);
  }

  @MessagePattern('list_users')
  listUsers(@Payload() query: FilterUsersDto) {
    return this.usersService.listUsers(query);
  }

  @MessagePattern('create_audit_log')
  createAuditLog(@Payload() dto: CreateAuditLogDto) {
    return this.usersService.createAuditLog(dto);
  }

  @MessagePattern('get_audit_logs')
  getAuditLogs(@Payload() query: FilterAuditLogsDto) {
    return this.usersService.getAuditLogs(query);
  }

  @MessagePattern('get_user_metrics')
  getUserMetrics() {
    return this.usersService.getUserMetrics();
  }

  // --- Staff & Fleet Management ---
  @MessagePattern('create_staff')
  createStaff(@Payload() payload: { sellerId: string; dto: CreateStaffDto }) {
    return this.usersService.createStaff(payload.sellerId, payload.dto);
  }

  @MessagePattern('get_seller_staff')
  getSellerStaff(@Payload() payload: { sellerId: string }) {
    return this.usersService.getSellerStaff(payload.sellerId);
  }

  @MessagePattern('update_staff')
  updateStaff(
    @Payload()
    payload: {
      sellerId: string;
      staffId: string;
      dto: UpdateStaffDto;
    },
  ) {
    return this.usersService.updateStaff(
      payload.sellerId,
      payload.staffId,
      payload.dto,
    );
  }

  @MessagePattern('delete_staff')
  deleteStaff(@Payload() payload: { sellerId: string; staffId: string }) {
    return this.usersService.deleteStaff(payload.sellerId, payload.staffId);
  }

  @MessagePattern('authenticate_staff')
  authenticateStaff(@Payload() payload: { identifier: string; password?: string }) {
    return this.usersService.authenticateStaff(payload.identifier, payload.password);
  }
}
