import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export enum OnboardingQuestionType {
  SINGLE = 'single_choice',
  MULTIPLE = 'multiple_choice',
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
}


@Schema({ timestamps: true })
export class OnboardingQuestion extends Document {

  @Prop({ required: true })
  text: string;

  @Prop({ required: true, enum: OnboardingQuestionType })
  type: string;

  @Prop({ type: [String] })
  choices?: string[];

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isRequired: boolean;

  @Prop({
  type: {
    min: Number,
    max: Number,
    regex: String,
  },
})
validation?: {
  min?: number;
  max?: number;
  regex?: string;
};

}

export const OnboardingQuestionSchema = SchemaFactory.createForClass(OnboardingQuestion)
OnboardingQuestionSchema.index({ order: 1, isActive: 1 });
