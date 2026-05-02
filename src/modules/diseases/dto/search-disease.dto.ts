import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchDiseaseDto {
  @ApiProperty({
    example: 'hypertension',
    description: 'Search query for disease name or synonyms',
  })
  @IsString()
  query: string;
}