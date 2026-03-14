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

/**
 * Which category of medical information this question targets.
 * Used to route answers to the right risk-scoring module.
 */
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
  /**
   * Stable machine-readable key used to look up answers later (e.g. "has_diabetes", "known_allergies")
   */
  @Prop({ required: true, unique: true, trim: true })
  key: string;

  @Prop({ required: true })
  text: string;

  /**
   * Optional subtitle / hint shown below the main question
   */
  @Prop()
  hint?: string;

  @Prop({ required: true, enum: OnboardingQuestionType })
  type: OnboardingQuestionType;

  @Prop({ enum: OnboardingQuestionCategory, default: OnboardingQuestionCategory.OTHER })
  category: OnboardingQuestionCategory;

  /**
   * Only populated for SINGLE_CHOICE and MULTIPLE_CHOICE types
   */
  @Prop({ type: [String], default: [] })
  choices: string[];

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isRequired: boolean;

  /**
   * Validation constraints for NUMBER and TEXT types
   */
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

  /**
   * If set, this question is only shown when another question has a specific answer.
   * e.g. { questionKey: "has_allergies", expectedValue: true }
   */
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

export const OnboardingQuestionSchema = SchemaFactory.createForClass(OnboardingQuestion);
OnboardingQuestionSchema.index({ order: 1, isActive: 1 });
OnboardingQuestionSchema.index({ category: 1, isActive: 1 });