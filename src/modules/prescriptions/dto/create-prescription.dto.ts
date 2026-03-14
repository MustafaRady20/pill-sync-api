import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PrescriptionItemDto {
  @ApiProperty({ example: '665f1a2b3c4d5e6f7a8b9c0d' })
  @IsMongoId()
  drugId: string;

  @ApiProperty({ example: '500mg twice daily with food' })
  @IsString()
  dosageInstruction: string;

  @ApiProperty({ example: 7, required: false })
  @IsOptional()
  @IsNumber()
  durationDays?: number;

  @ApiProperty({ example: 14, required: false })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ example: 'For bacterial infection', required: false })
  @IsOptional()
  @IsString()
  indication?: string;
}

export class CreatePrescriptionDto {
  @ApiProperty({ example: '665f1a2b3c4d5e6f7a8b9c0d' })
  @IsMongoId()
  patientId: string;

  @ApiProperty({ type: [PrescriptionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items: PrescriptionItemDto[];

  @ApiProperty({ example: 'Patient presenting with URI', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
