import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateDrugDto {
  @ApiProperty()
  @IsString()
  senomeCode: string;

  @ApiProperty()
  @IsString()
  tradeName: string;

  @ApiProperty()
  @IsString()
  genericName: string;

  @ApiProperty()
  @IsString()
  dose: string;

  @ApiPropertyOptional()
  @IsString()
  strength?: string;

  @ApiProperty()
  @IsString()
  form: string;

  @ApiProperty()
  @IsString()
  route: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  similarTradeNames?: string[];
}
