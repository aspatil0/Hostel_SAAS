import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PropertyType } from '@prisma/client';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty({ message: 'Property name is required' })
  @MaxLength(255)
  name: string;

  @IsEnum(PropertyType, {
    message: `Property type must be one of: ${Object.values(PropertyType).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Property type is required' })
  propertyType: PropertyType;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @IsOptional()
  address?: string;
}
