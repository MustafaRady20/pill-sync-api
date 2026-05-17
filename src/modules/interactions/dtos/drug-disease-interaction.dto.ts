import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import {
  DrugDiseaseRelation,
  InteractionSeverity,
} from '../schema/drug-disease-interaction.schema';

export class CreateDrugDiseaseInteractionDto {
  @ApiProperty({ example: '665f1a2b3c4d5e6f7a8b9c0d' })
  @IsMongoId()
  drug: string;

  @ApiProperty({ example: '665f1a2b3c4d5e6f7a8b9c0e' })
  @IsMongoId()
  disease: string;

  @ApiProperty({
    enum: DrugDiseaseRelation,
    example: DrugDiseaseRelation.CONTRAINDICATION,
  })
  @IsEnum(DrugDiseaseRelation)
  relation: DrugDiseaseRelation;

  @ApiProperty({
    enum: InteractionSeverity,
    example: InteractionSeverity.CONTRAINDICATED,
  })
  @IsEnum(InteractionSeverity)
  severity: InteractionSeverity;

  @ApiProperty({
    example: 'NSAIDs are contraindicated in active peptic ulcer disease',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'Inhibition of COX-1 reduces mucosal protection',
    required: false,
  })
  @IsOptional()
  @IsString()
  mechanism?: string;

  @ApiProperty({
    example: '500mg twice daily with food',
    required: false,
    description: 'For Indication relation only',
  })
  @IsOptional()
  @IsString()
  recommendedDose?: string;

  @ApiProperty({ example: 'WHO Essential Medicines 2023', required: false })
  @IsOptional()
  @IsString()
  source?: string;
}

export class UpdateDrugDiseaseInteractionDto extends PartialType(
  CreateDrugDiseaseInteractionDto,
) {}
