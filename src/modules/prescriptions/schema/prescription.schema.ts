import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PrescriptionDocument = Prescription & Document;

export enum PrescriptionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class PrescriptionItem {
  @Prop({ type: Types.ObjectId, ref: 'Drug', required: true })
  drug: Types.ObjectId;

  @Prop({ type: String, required: true })
  dosageInstruction: string;

  @Prop({ type: Number })
  durationDays?: number;

  @Prop({ type: Number })
  quantity?: number;

  @Prop({ type: String })
  indication?: string;
}

@Schema({ timestamps: true })
export class Prescription {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  doctorId: Types.ObjectId;

  @Prop({ type: [PrescriptionItem], required: true, default: [] })
  items: PrescriptionItem[];

  @Prop({
    type: String,
    enum: PrescriptionStatus,
    default: PrescriptionStatus.DRAFT,
    index: true,
  })
  status: PrescriptionStatus;

  @Prop({ type: Date })
  prescribedAt?: Date;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ type: String })
  notes?: string;

  @Prop({
    type: {
      checkedAt: Date,
      passed: Boolean,
      allergyWarnings: [Object],
      drugDrugWarnings: [Object],
      drugDiseaseWarnings: [Object],
    },
    default: null,
  })
  safetyCheckResult?: {
    checkedAt: Date;
    passed: boolean;
    allergyWarnings: Array<{
      drugId: string;
      allergyName: string;
      severity: string;
    }>;
    drugDrugWarnings: Array<{
      drug_a: string;
      drug_b: string;
      severity: string;
      description: string;
    }>;
    drugDiseaseWarnings: Array<{
      drugId: string;
      diseaseId: string;
      relation: string;
      severity: string;
      description: string;
    }>;
  };

  @Prop({ type: Boolean, default: false })
  safetyOverride: boolean;

  @Prop({ type: String, default: null })
  safetyOverrideReason?: string;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);
PrescriptionSchema.index({ patientId: 1, status: 1 });
PrescriptionSchema.index({ doctorId: 1, createdAt: -1 });
