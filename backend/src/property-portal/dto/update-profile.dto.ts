import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsObject()
  hostelData?: {
    name?: string;
    tagline?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    contactPhone?: string;
    contactEmail?: string;
    totalRooms?: number;
    totalBeds?: number;
    curfewTime?: string;
    messBreakfast?: string;
    messDinner?: string;
  };

  @IsOptional()
  @IsObject()
  managerData?: {
    name?: string;
    role?: string;
    phone?: string;
    email?: string;
    emergencyPhone?: string;
  };

  @IsOptional()
  @IsObject()
  amenities?: Record<string, boolean>;

  @IsOptional()
  propertyId?: number;
}
