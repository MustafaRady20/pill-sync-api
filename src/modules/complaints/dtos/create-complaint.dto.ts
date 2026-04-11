import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsString, IsEnum, IsMongoId,
    IsBoolean, IsOptional, ValidateIf,
} from "class-validator";

export class CreateComplaintDto {
    @ApiProperty({ example: "Severe headache after taking medication" })
    @IsString()
    description: string;

    @ApiProperty({ enum: ["low", "medium", "high"], example: "medium" })
    @IsEnum(["low", "medium", "high"])
    severity: "low" | "medium" | "high";

    @ApiProperty({ example: "64a1f2c3e4b0a1234567890a", description: "Patient ObjectId" })
    @IsMongoId()
    patientId: string;

    @ApiProperty({ example: "2024-01-15", description: "When the complaint started" })
    @IsString()
    startDate: string;

    @ApiProperty({ example: "3 days", description: "How long the complaint has lasted" })
    @IsString()
    duration: string;

    @ApiProperty({ example: "Twice a day", description: "How often the complaint occurs" })
    @IsString()
    frequency: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    isDrugRelated: boolean;

    @ApiPropertyOptional({ example: "64a1f2c3e4b0a1234567890b", description: "Drug ObjectId — required if isDrugRelated is true" })
    @ValidateIf((o) => o.isDrugRelated === true)
    @IsMongoId()
    drugId?: string;
}