import { IsEnum, IsNotEmpty } from 'class-validator';
import { PropertyStatus } from '@prisma/client';

export class UpdatePropertyStatusDto {
  @IsEnum(PropertyStatus, {
    message: `Status must be one of: ${Object.values(PropertyStatus).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Status is required' })
  status: PropertyStatus;
}
