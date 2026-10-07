import { UserRole } from '../enums/role.enum';

export interface JwtPayload {
  sub: string;
  phoneNumber?: string;
  email?: string;
  role: UserRole;
}
