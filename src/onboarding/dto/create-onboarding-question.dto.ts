import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';
import { OnboardingQuestionType } from '../schema/onboarding-question.schema';


export class CreateOnboardingQuestionDto {
  @IsString()
  key: string;

  @IsString()
  text: string;

  @IsEnum(OnboardingQuestionType)
  type: OnboardingQuestionType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  choices?: string[];

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  validation?: {
    min?: number;
    max?: number;
    regex?: string;
  };
}
