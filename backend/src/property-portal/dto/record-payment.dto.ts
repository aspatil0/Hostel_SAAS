import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class RecordPaymentDto {
  @IsString()
  @IsNotEmpty({ message: 'Student ID is required' })
  studentId: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty({ message: 'Payment mode is required' })
  paymentMode: string;

  @IsString()
  @IsOptional()
  transactionRef?: string;

  @IsString()
  @IsOptional()
  paymentDate?: string;

  @IsString()
  @IsOptional()
  month?: string;

  @IsOptional()
  @IsNumber()
  propertyId?: number;
}
