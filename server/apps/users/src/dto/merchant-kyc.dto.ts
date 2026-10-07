import { IsNotEmpty, IsString } from 'class-validator';

export class MerchantKycDto {
  @IsString()
  @IsNotEmpty()
  shopName: string;

  @IsString()
  @IsNotEmpty()
  marketZone: string;

  @IsString()
  @IsNotEmpty()
  tradeLicenseNumber: string;

  @IsString()
  @IsNotEmpty()
  tinNumber: string;
}
