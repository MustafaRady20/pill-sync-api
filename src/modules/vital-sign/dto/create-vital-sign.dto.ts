import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsMongoId,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MeasurementCondition } from '../schema/vital-sign.schema';

class NormalRangeDto {
  @ApiProperty({ example: 70 })
  @IsNumber()
  min: number;

  @ApiProperty({ example: 120 })
  @IsNumber()
  max: number;
}

export class CreateVitalSignDto {
  @ApiProperty({
    example: '64a1f2c3e4b0a1234567890a',
    description: 'Patient ObjectId',
  })
  @IsMongoId()
  patientId: string;

  @ApiProperty({
    example: 'blood_pressure',
    description: 'Type of vital sign or lab test',
  })
  @IsString()
  type: string;

  @ApiProperty({ example: 120 })
  @IsNumber()
  value: number;

  @ApiProperty({ example: 'mmHg' })
  @IsString()
  unit: string;

  @ApiPropertyOptional({
    type: NormalRangeDto,
    description: 'Normal medical range',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NormalRangeDto)
  normalRange?: NormalRangeDto;

  @ApiProperty({ example: '2024-06-15T08:30:00.000Z' })
  @IsDateString()
  measuredAt: string;

  @ApiProperty({
    enum: MeasurementCondition,
    example: MeasurementCondition.BEFORE_MEDICATION,
  })
  @IsEnum(MeasurementCondition)
  measurementCondition: MeasurementCondition;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasReminder?: boolean;

  @ApiPropertyOptional({ example: '2024-06-16T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  reminderAt?: string;

  @ApiPropertyOptional({ example: '64a1f2c3e4b0a1234567890b' })
  @IsOptional()
  @IsMongoId()
  diseaseId?: string;

  @ApiPropertyOptional({ example: '64a1f2c3e4b0a1234567890c' })
  @IsOptional()
  @IsMongoId()
  drugId?: string;

  @ApiPropertyOptional({ example: 'Measured after morning walk' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: ['https://cdn.example.com/lab-result.pdf'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachedFiles?: string[];
}
