import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type VitalSignDocument = VitalSign & Document;

export enum MeasurementCondition {
  BEFORE_MEDICATION = "before_medication",
  AFTER_MEDICATION  = "after_medication",
  BEFORE_EATING     = "before_eating",
  AFTER_EATING      = "after_eating",
  FASTING           = "fasting",
  RESTING           = "resting",
  NOT_RELATED       = "not_related",
}

@Schema({ timestamps: true })
export class VitalSign {

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  patientId: Types.ObjectId;

  @Prop({ type: String, required: true })
  type: string; 

  @Prop({ type: Number, required: true })
  value: number;

  @Prop({ type: String, required: true })
  unit: string; 

  @Prop({
    type: { min: Number, max: Number },
    required: false,
  })
  normalRange?: { min: number; max: number };

  @Prop({ type: Date, required: true })
  measuredAt: Date;

  @Prop({
    type: String,
    enum: Object.values(MeasurementCondition),
    required: true,
  })
  measurementCondition: MeasurementCondition;

 
  @Prop({ type: Boolean, default: false })
  hasReminder: boolean;

  @Prop({ type: Date, default: null })
  reminderAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: "Disease", default: null })
  diseaseId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: "Drug", default: null })
  drugId: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  notes: string | null;

  @Prop({ type: [String], default: [] })
  attachedFiles: string[]
}

export const VitalSignSchema = SchemaFactory.createForClass(VitalSign);