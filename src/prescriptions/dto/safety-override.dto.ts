import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SafetyOverrideDto {
  @ApiProperty({
    example: 'Patient has been stable on this combination for 2 years — risk is acceptable',
  })
  @IsString()
  reason: string;
}