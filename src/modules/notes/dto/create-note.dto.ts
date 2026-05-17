import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsMongoId,
  IsBoolean,
  IsOptional,
  IsArray,
  IsDateString,
  IsNumber,
  Min,
  ValidateIf,
} from 'class-validator';
import { NoteType, ReminderRepeatUnit } from '../schema/note.schema';

export class CreateNoteDto {
  @ApiProperty({ example: '64a1f2c3e4b0a1234567890a' })
  @IsMongoId()
  patientId: string;

  @ApiProperty({ enum: NoteType, example: NoteType.DISEASE })
  @IsEnum(NoteType)
  type: NoteType;

  @ApiProperty({ example: 'Patient reported chest pain after medication' })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    example: ['https://bucket.s3.region.amazonaws.com/notes/uuid.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachedFiles?: string[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasReminder?: boolean;

  @ApiPropertyOptional({ example: '2024-06-20T09:00:00.000Z' })
  @ValidateIf((o) => o.hasReminder === true)
  @IsDateString()
  reminderAt?: string;

  @ApiPropertyOptional({ example: 2, description: 'Repeat every X units' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  repeatEvery?: number;

  @ApiPropertyOptional({
    enum: ReminderRepeatUnit,
    example: ReminderRepeatUnit.DAYS,
  })
  @IsOptional()
  @IsEnum(ReminderRepeatUnit)
  repeatUnit?: ReminderRepeatUnit;
}
