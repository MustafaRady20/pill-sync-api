import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { NotificationType } from '../../../common/enums/notification-type.enum';

export class CreateNotificationDto {
  @ApiProperty({ example: 'user_123' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'Welcome!' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Thanks for joining us.' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @ValidateIf((o) => o.type === NotificationType.EMAIL || o.type === NotificationType.BOTH)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}