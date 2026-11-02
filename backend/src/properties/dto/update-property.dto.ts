import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PropertyType } from '../../common/enums.js';

export class UpdatePropertyDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsEnum(PropertyType, {
    message: `Property type must be one of: ${Object.values(PropertyType).join(', ')}`,
  })
  @IsOptional()
  propertyType?: PropertyType;

  @IsString()
  @IsOptional()
  address?: string;
}
