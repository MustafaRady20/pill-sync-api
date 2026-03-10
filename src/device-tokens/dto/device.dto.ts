import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Platform } from '../schema/device-token.schema';

export class SaveDeviceTokenDto {
  @ApiProperty({ example: 'user_123' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'fcm_token_here' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ enum: Platform })
  @IsEnum(Platform)
  platform: Platform;
}