import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  ArrayUnique,
} from 'class-validator';

export class CreateDiseaseDto {
  @ApiProperty({
    example: 'D-001',
    description: 'Unique disease code',
  })
  @IsString()
  diseaseCode: string;

  @ApiProperty({
    example: 'Diabetes Mellitus',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: ['High blood sugar', 'DM'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  @IsOptional()
  similarNames?: string[];
}

