import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsMongoId,
  IsDateString,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'in-person' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'Dr. John Smith' })
  @IsString()
  doctorName: string;

  @ApiProperty({ example: '2024-06-15T10:30:00.000Z' })
  @IsDateString()
  appointmentDate: string;

  @ApiPropertyOptional({
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  })
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'cancelled', 'completed'])
  status?: string;

  @ApiPropertyOptional({ example: 'Cairo Medical Center' })
  @IsOptional()
  @IsString()
  place?: string;

  @ApiProperty({ example: 'Routine checkup' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: 'Bring previous lab results' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    example: '64a1f2c3e4b0a1234567890a',
    description: 'Patient ObjectId',
  })
  @IsMongoId()
  patientId: string;

  @ApiPropertyOptional({
    example: ['ID card', 'Insurance card', 'Lab results'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  thingsToBring?: string[];
}
