import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional, IsString, NotEquals } from 'class-validator';
import { DrugInteractionSeverity } from '../schema/drug-drug-interaction.schema';

export class CreateDrugDrugInteractionDto {
  @ApiProperty({ example: '665f1a2b3c4d5e6f7a8b9c0d' })
  @IsMongoId()
  drug_a: string;

  @ApiProperty({ example: '665f1a2b3c4d5e6f7a8b9c0e' })
  @IsMongoId()
  drug_b: string;

  @ApiProperty({ enum: DrugInteractionSeverity, example: DrugInteractionSeverity.MAJOR })
  @IsEnum(DrugInteractionSeverity)
  severity: DrugInteractionSeverity;

  @ApiProperty({ example: 'Concurrent use increases risk of serotonin syndrome' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Both inhibit MAO reuptake', required: false })
  @IsOptional()
  @IsString()
  mechanism?: string;

  @ApiProperty({ example: 'Avoid combination. If unavoidable, monitor closely.', required: false })
  @IsOptional()
  @IsString()
  managementAdvice?: string;

  @ApiProperty({ example: 'Micromedex 2024', required: false })
  @IsOptional()
  @IsString()
  source?: string;
}

export class UpdateDrugDrugInteractionDto extends PartialType(CreateDrugDrugInteractionDto) {}