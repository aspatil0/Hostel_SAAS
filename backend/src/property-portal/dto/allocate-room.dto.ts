import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AllocateRoomDto {
  @IsString()
  @IsNotEmpty({ message: 'Room number is required' })
  roomNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Bed ID is required' })
  bedId: string;

  @IsString()
  @IsNotEmpty({ message: 'Status is required' })
  status: 'occupied' | 'vacant' | 'maintenance';

  @IsOptional()
  student?: {
    name: string;
    phone: string;
    college?: string;
    checkInDate?: string;
    rent?: number;
  };

  @IsOptional()
  @IsNumber()
  propertyId?: number;
}
