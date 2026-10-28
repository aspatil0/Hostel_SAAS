import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatus } from '../../common/enums.js';

export class UpdateAdminStatusDto {
  @IsEnum(UserStatus, {
    message: `Status must be one of: ${Object.values(UserStatus).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Status is required' })
  status: UserStatus;
}
