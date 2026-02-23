import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AllergySeverity, AllergyType } from '../schema/patient-allergy.schema';

export class CreateAllergyDto {
  @ApiProperty({
    example: 'penicillin',
    description: 'Drug name, ingredient, or drug class. Will be normalized to lowercase.',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    enum: AllergyType,
    default: AllergyType.DRUG,
    required: false,
    description: 'Auto-detected from DB lookup if omitted.',
  })
  @IsOptional()
  @IsEnum(AllergyType)
  allergyType?: AllergyType;

  @ApiProperty({
    enum: AllergySeverity,
    default: AllergySeverity.UNKNOWN,
    required: false,
  })
  @IsOptional()
  @IsEnum(AllergySeverity)
  severity?: AllergySeverity;

  @ApiProperty({
    example: 'Hives and throat swelling',
    required: false,
    description: 'Free-text description of the reaction the patient experiences.',
  })
  @IsOptional()
  @IsString()
  reaction?: string;
}

