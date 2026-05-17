import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserProfileDocument = UserProfile & Document;

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

export type DiseaseSeverity = 'mild' | 'moderate' | 'severe';

@Schema({ _id: false })
export class MedicalCondition {
  @ApiProperty({
    example: 'CV',
    description: 'Disease category code from Dim4',
  })
  @Prop({ type: String, required: true })
  categoryCode: string;

  @ApiProperty({ example: 'CVHIC1', required: false })
  @Prop({ type: String, required: false, default: null })
  diseaseCode?: string | null;

  @ApiProperty({ example: 'مرض نادر في الكبد', required: false })
  @Prop({ type: String, required: false, default: null })
  customDiseaseName?: string | null;

  @ApiProperty({ enum: ['mild', 'moderate', 'severe'], required: false })
  @Prop({
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    required: false,
    default: null,
  })
  severity?: DiseaseSeverity | null;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, required: false, default: null })
  hasSeenDoctor?: boolean | null;

  @Prop({ type: String, required: false, default: null })
  subType?: string | null;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  extraAnswers: Record<string, any>;
}
export const MedicalConditionSchema =
  SchemaFactory.createForClass(MedicalCondition);

// ─── Drug & Food Allergy ──────────────────────────────────────────────────────

@Schema({ _id: false })
export class AllergyInfo {
  @Prop({ type: [String], default: [] })
  predefined: string[];

  @Prop({ type: [String], default: [] })
  custom: string[];
}
export const AllergyInfoSchema = SchemaFactory.createForClass(AllergyInfo);

// ─── Main UserProfile ─────────────────────────────────────────────────────────

@Schema({ timestamps: true })
export class UserProfile {
  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  })
  userId: Types.ObjectId;

  // ── Personal info ──────────────────────────────────────────────────────────

  @ApiProperty({ example: 'محمد سلطان' })
  @Prop({ type: String, required: true, trim: true })
  fullName: string;

  @ApiProperty({ example: '1984-01-22' })
  @Prop({ type: Date })
  birthDate: Date;

  @ApiProperty({ enum: ['male', 'female'] })
  @Prop({ type: String, enum: ['male', 'female'] })
  gender: string;

  // ── Female-specific ────────────────────────────────────────────────────────

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, required: false, default: null })
  isBreastfeeding?: boolean | null;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, required: false, default: null })
  isPregnant?: boolean | null;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, required: false, default: null })
  isNaturalBreastfeeding?: boolean | null;

  @ApiProperty({ enum: ['regular', 'irregular'], required: false })
  @Prop({
    type: String,
    enum: ['regular', 'irregular'],
    required: false,
    default: null,
  })
  menstrualCycle?: string | null;

  // ── Physical ───────────────────────────────────────────────────────────────

  @ApiProperty({ example: 75 })
  @Prop({ type: Number, min: 0 })
  weightKg: number;

  @ApiProperty({ example: 170 })
  @Prop({ type: Number, min: 0 })
  heightCm: number;

  // ── Medication preferences ────────────────────────────────────────────────

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, required: false, default: null })
  selfMedicates?: boolean | null;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, required: false, default: null })
  helpOthers?: boolean | null;

  // ── Allergies ─────────────────────────────────────────────────────────────

  @ApiProperty({ type: AllergyInfo })
  @Prop({
    type: AllergyInfoSchema,
    default: () => ({ predefined: [], custom: [] }),
  })
  drugAllergies: AllergyInfo;

  @ApiProperty({ type: AllergyInfo })
  @Prop({
    type: AllergyInfoSchema,
    default: () => ({ predefined: [], custom: [] }),
  })
  foodAllergies: AllergyInfo;

  // ── Medical history ───────────────────────────────────────────────────────

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  hasConditions: boolean;

  @ApiProperty({ type: [MedicalCondition] })
  @Prop({ type: [MedicalConditionSchema], default: [] })
  conditions: MedicalCondition[];

  // ── Onboarding progress ───────────────────────────────────────────────────

  @ApiProperty({ default: 0 })
  @Prop({ type: Number, default: 0, min: 0, max: 3 })
  onboardingStep: number;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
