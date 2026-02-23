import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PrescriptionDocument = Prescription & Document;

export enum PrescriptionStatus {
  DRAFT = 'draft',         // doctor is writing it, not yet submitted
  ACTIVE = 'active',       // patient is currently taking these drugs
  COMPLETED = 'completed', // course finished
  CANCELLED = 'cancelled', // withdrawn by doctor
}

/**
 * A single drug line inside a prescription
 */
export class PrescriptionItem {
  @Prop({ type: Types.ObjectId, ref: 'Drug', required: true })
  drug: Types.ObjectId;

  /** Free-text dose instruction, e.g. "500mg twice daily with food" */
  @Prop({ type: String, required: true })
  dosageInstruction: string;

  /** Duration in days */
  @Prop({ type: Number })
  durationDays?: number;

  /** Number of units to dispense */
  @Prop({ type: Number })
  quantity?: number;

  /** Clinical reason for this specific drug */
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

  @Prop({ type: String, enum: PrescriptionStatus, default: PrescriptionStatus.DRAFT, index: true })
  status: PrescriptionStatus;

  @Prop({ type: Date })
  prescribedAt?: Date;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ type: String })
  notes?: string;

  /**
   * Safety check result snapshot — stored so we have an audit trail.
   * Populated automatically before status changes from DRAFT → ACTIVE.
   */
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

  /**
   * Whether the doctor explicitly overrode safety warnings.
   * Must be recorded with a reason if true.
   */
  @Prop({ type: Boolean, default: false })
  safetyOverride: boolean;

  @Prop({ type: String, default: null })
  safetyOverrideReason?: string;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);
PrescriptionSchema.index({ patientId: 1, status: 1 });
PrescriptionSchema.index({ doctorId: 1, createdAt: -1 });