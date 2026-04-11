import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: String, required: true })
  doctorName: string;

  @Prop({ type: Date, required: true })
  appointmentDate: Date;

  @Prop({ type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" })
  status: string;

  @Prop({ type: String, required: false })
  place: string;

  @Prop({ type: String, required: true })
  reason: string;

  @Prop({ type: String, required: false })
  notes: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  patientId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  thingsToBring: string[];
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);