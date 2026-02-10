import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PatientAnswerDocument = PatientAnswer & Document;

@Schema({ timestamps: true })
export class PatientAnswer {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: string;

  @Prop({ required: true })
  questionKey: string; 

  @Prop({ required: true })
  value: string | number | boolean | string[]; 

  @Prop({ default: null })
  normalizedValue?: string; 

  @Prop({ default: 0 })
  riskScore?: number; 
}

export const PatientAnswerSchema = SchemaFactory.createForClass(PatientAnswer);
