import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OnboardingQuestionDocument = OnboardingQuestion & Document;

export enum OnboardingQuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
}

export enum OnboardingQuestionCategory {
  DEMOGRAPHICS = 'demographics',
  CHRONIC_DISEASES = 'chronic_diseases',
  ALLERGIES = 'allergies',
  CURRENT_MEDICATIONS = 'current_medications',
  LIFESTYLE = 'lifestyle',
  FAMILY_HISTORY = 'family_history',
  SURGICAL_HISTORY = 'surgical_history',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class OnboardingQuestion {
  @Prop({ required: true, unique: true, trim: true })
  key: string;

  @Prop({ required: true })
  text: string;

  @Prop()
  hint?: string;

  @Prop({ required: true, enum: OnboardingQuestionType })
  type: OnboardingQuestionType;

  @Prop({
    enum: OnboardingQuestionCategory,
    default: OnboardingQuestionCategory.OTHER,
  })
  category: OnboardingQuestionCategory;

  @Prop({ type: [String], default: [] })
  choices: string[];

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isRequired: boolean;

  @Prop({
    type: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
      regex: { type: String, default: null },
    },
    default: null,
  })
  validation?: {
    min?: number;
    max?: number;
    regex?: string;
  };

  @Prop({
    type: {
      questionKey: String,
      expectedValue: Object,
    },
    default: null,
  })
  showIf?: {
    questionKey: string;
    expectedValue: unknown;
  };
}

export const OnboardingQuestionSchema =
  SchemaFactory.createForClass(OnboardingQuestion);
OnboardingQuestionSchema.index({ order: 1, isActive: 1 });
OnboardingQuestionSchema.index({ category: 1, isActive: 1 });
