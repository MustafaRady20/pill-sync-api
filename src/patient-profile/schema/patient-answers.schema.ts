import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type PatientAnswerDocument = PatientAnswer & Document;

@Schema({ timestamps: true })
export class PatientAnswer {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  patientId: Types.ObjectId;

  /**
   * Matches OnboardingQuestion.key — no ObjectId ref so answers survive question edits
   */
  @Prop({ required: true, index: true })
  questionKey: string;

  /**
   * Raw answer as the user submitted it
   */
  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  value: string | number | boolean | string[];

  /**
   * Canonical form after normalization (lowercase, trimmed, mapped to standard term)
   * e.g. "Asprin" → "aspirin", "dm2" → "type_2_diabetes"
   */
  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  normalizedValue?: string | string[];

  /**
   * Risk contribution of this single answer (0–100)
   * Aggregated across all answers to build overall patient risk profile
   */
  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  riskScore: number;
}

export const PatientAnswerSchema = SchemaFactory.createForClass(PatientAnswer);

// One answer per patient per question (upsert-friendly)
PatientAnswerSchema.index({ patientId: 1, questionKey: 1 }, { unique: true });