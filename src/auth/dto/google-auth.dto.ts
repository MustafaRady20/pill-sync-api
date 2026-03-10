import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google ID Token returned from Google OAuth',
    example:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2ODk4ZTg5NjU4Y...',
  })
  @IsString()
  idToken: string;
}