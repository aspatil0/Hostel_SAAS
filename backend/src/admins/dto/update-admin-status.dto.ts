import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class UpdateAdminStatusDto {
  @IsEnum(UserStatus, {
    message: `Status must be one of: ${Object.values(UserStatus).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Status is required' })
  status: UserStatus;
}
