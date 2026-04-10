import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ComplaintDocument = Complaint & Document;

@Schema({ timestamps: true })
export class Complaint {

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, enum: ["low", "medium", "high"], required: true })
  severity: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  patientId: Types.ObjectId;

  @Prop({ type: String, required: true })
  startDate: string;

  @Prop({ type: String, required: true })
  duration: string;

  @Prop({ type: String, required: true })
  frequency: string;

  @Prop({ type: Boolean, required: true })
  isDrugRelated: boolean;

  @Prop({ type: Types.ObjectId, ref: "Drug", default: null })
  drugId: Types.ObjectId | null;
}

export const ComplaintSchema = SchemaFactory.createForClass(Complaint);