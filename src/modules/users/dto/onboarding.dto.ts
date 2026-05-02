import {
  IsString,
  IsDateString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
  Max,
  IsNotEmpty,
  ValidateNested,
  IsObject,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Shared sub-DTOs ─────────────────────────────────────────────────────────

export class AllergyInfoDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  predefined?: string[] = [];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  custom?: string[] = [];
}

export class MedicalConditionDto {
  @ApiProperty({ example: 'CV', description: 'Category disease code (Dim4)' })
  @IsString()
  @IsNotEmpty()
  categoryCode: string;

  @ApiPropertyOptional({ example: 'CVHIC1' })
  @IsOptional()
  @IsString()
  diseaseCode?: string | null;

  @ApiPropertyOptional({ example: 'مرض نادر في الكبد' })
  @IsOptional()
  @IsString()
  customDiseaseName?: string | null;

  @ApiPropertyOptional({ enum: ['mild', 'moderate', 'severe'] })
  @IsOptional()
  @IsIn(['mild', 'moderate', 'severe'])
  severity?: 'mild' | 'moderate' | 'severe' | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasSeenDoctor?: boolean | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subType?: string | null;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  extraAnswers?: Record<string, any>;
}

// ─── Step 1: Personal Info ────────────────────────────────────────────────────

export class PersonalInfoDto {
  @ApiProperty({ example: 'علياء محمد سلطان' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '1984-01-22' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ enum: ['male', 'female'] })
  @IsEnum(['male', 'female'])
  gender: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBreastfeeding?: boolean | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPregnant?: boolean | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isNaturalBreastfeeding?: boolean | null;

  @ApiPropertyOptional({ enum: ['regular', 'irregular'] })
  @IsOptional()
  @IsIn(['regular', 'irregular'])
  menstrualCycle?: string | null;

  @ApiProperty({ example: 75 })
  @IsNumber()
  @Min(1)
  @Max(500)
  weightKg: number;

  @ApiProperty({ example: 170 })
  @IsNumber()
  @Min(1)
  @Max(300)
  heightCm: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  selfMedicates?: boolean | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  helpOthers?: boolean | null;
}

// ─── Step 2: Allergies ────────────────────────────────────────────────────────

export class AllergiesDto {
  @ApiPropertyOptional({ type: AllergyInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AllergyInfoDto)
  drugAllergies?: AllergyInfoDto;

  @ApiPropertyOptional({ type: AllergyInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AllergyInfoDto)
  foodAllergies?: AllergyInfoDto;
}

// ─── Step 3: Medical History ──────────────────────────────────────────────────

export class MedicalHistoryDto {
  @ApiProperty()
  @IsBoolean()
  hasConditions: boolean;

  @ApiPropertyOptional({ type: [MedicalConditionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicalConditionDto)
  conditions?: MedicalConditionDto[];
}