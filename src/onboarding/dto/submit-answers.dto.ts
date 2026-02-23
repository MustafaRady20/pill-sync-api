import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';

export class AnswerItemDto {
  @ApiProperty({ example: 'known_allergies' })
  @IsString()
  questionKey: string;

  @ApiProperty({
    example: ['Penicillin', 'Aspirin'],
    description: 'Can be string | number | boolean | string[]',
  })
  value: string | number | boolean | string[];
}

export class SubmitAnswersDto {
  @ApiProperty({ type: [AnswerItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];
}