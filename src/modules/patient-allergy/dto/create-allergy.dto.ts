import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { AllergySeverity, AllergyType } from '../schema/patient-allergy.schema';

export class CreateAllergyDto {
  @ApiProperty({
    example: 'penicillin',
    description:
      'Drug name, active ingredient, or drug class. ' +
      'Automatically normalized to lowercase. ' +
      'Used for fuzzy-matching against the Drug collection.',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    enum: AllergyType,
    default: AllergyType.DRUG,
    required: false,
    description:
      'Auto-detected via drug DB lookup if omitted. ' +
      'Set to DRUG_CLASS when the allergy covers an entire pharmacological group (e.g. "penicillins").',
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
    example: 'Hives and throat swelling within 10 minutes of exposure',
    required: false,
    description: 'Free-text description of the reaction the patient experiences.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reaction?: string;
}