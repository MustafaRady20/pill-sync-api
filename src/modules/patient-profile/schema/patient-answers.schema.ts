import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type PatientAnswerDocument = PatientAnswer & Document;

@Schema({ timestamps: true })
export class PatientAnswer {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  patientId: Types.ObjectId;

  @Prop({ required: true, index: true })
  questionKey: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  value: string | number | boolean | string[];

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  normalizedValue?: string | string[];

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  riskScore: number;
}

export const PatientAnswerSchema = SchemaFactory.createForClass(PatientAnswer);

PatientAnswerSchema.index({ patientId: 1, questionKey: 1 }, { unique: true });
