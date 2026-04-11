import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type NoteDocument = Note & Document;

export enum NoteType {
  DISEASE                   = "disease",
  SIDE_EFFECTS              = "side_effects",
  TREATMENT                 = "treatment",
  VITAL_SIGN_LAB            = "vital_sign_lab",
  INJURIES                  = "injuries",
  WOUND_IMAGE               = "wound_image",
  MEDICAL_REPORTS           = "medical_reports",
  DOCTOR_FOLLOW_UP          = "doctor_follow_up",
  SURGICAL_ADMISSION        = "surgical_admission",
  REFILL                    = "refill",
  CLINICAL_MEETING          = "clinical_meeting",
  HEALTHCARE_PROVIDERS      = "healthcare_providers",
  MEDICAL_HISTORY           = "medical_history",
  APP_ITSELF                = "app_itself",
  MOOD_MENTAL_HEALTH        = "mood_mental_health",
  WATER_INTAKE              = "water_intake",
  OTHER                     = "other",
}

export enum ReminderRepeatUnit {
  HOURS  = "hours",
  DAYS   = "days",
  WEEKS  = "weeks",
  MONTHS = "months",
}

@Schema({ timestamps: true })
export class Note {

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  patientId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(NoteType), required: true })
  type: NoteType;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  attachedFiles: string[];


  @Prop({ type: Boolean, default: false })
  hasReminder: boolean;

  @Prop({ type: Date, default: null })
  reminderAt: Date | null;

  @Prop({ type: Number, default: null })
  repeatEvery: number | null;

  @Prop({
    type: String,
    enum: Object.values(ReminderRepeatUnit),
    default: null,
  })
  repeatUnit: ReminderRepeatUnit | null;
}

export const NoteSchema = SchemaFactory.createForClass(Note);