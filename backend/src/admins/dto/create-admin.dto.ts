import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsNumber,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255)
  name: string;

  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  email: string;

  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

  @IsOptional()
  @IsString()
  portalPassword?: string;

  // Accept integer number or formatted string like 'PROP-01' or '1'
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value.replace(/\D/g, ''), 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return typeof value === 'number' ? value : undefined;
  })
  propertyId?: number;

  @IsOptional()
  @IsString()
  propertyName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsOptional()
  totalRooms?: number;

  @IsOptional()
  totalBeds?: number;

  @IsOptional()
  occupiedBeds?: number;

  @IsOptional()
  status?: string;
}
