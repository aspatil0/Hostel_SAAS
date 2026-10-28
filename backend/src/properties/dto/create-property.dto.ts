import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PropertyType, PropertyStatus } from '../../common/enums.js';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty({ message: 'Property name is required' })
  @MaxLength(255)
  name: string;

  @IsEnum(PropertyType, {
    message: `Property type must be one of: ${Object.values(PropertyType).join(', ')}`,
  })
  @IsOptional()
  propertyType?: PropertyType;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  ownerName?: string;

  @IsString()
  @IsOptional()
  ownerPhone?: string;

  @IsString()
  @IsOptional()
  ownerEmail?: string;

  @IsOptional()
  totalRooms?: number;

  @IsOptional()
  totalBeds?: number;

  @IsOptional()
  portalPassword?: string;

  @IsOptional()
  status?: PropertyStatus | 'active' | 'inactive';
}
