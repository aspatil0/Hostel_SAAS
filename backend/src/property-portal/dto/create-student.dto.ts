import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty({ message: 'Resident name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  guardianName?: string;

  @IsString()
  @IsOptional()
  guardianPhone?: string;

  @IsString()
  @IsOptional()
  collegeOrCompany?: string;

  @IsString()
  @IsNotEmpty({ message: 'Room number is required' })
  roomNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Bed number is required' })
  bedNumber: string;

  @IsNumber()
  monthlyRent: number;

  @IsNumber()
  depositAmount: number;

  @IsString()
  @IsOptional()
  checkInDate?: string;

  @IsString()
  @IsOptional()
  idProofNumber?: string;

  @IsOptional()
  @IsNumber()
  propertyId?: number;
}
