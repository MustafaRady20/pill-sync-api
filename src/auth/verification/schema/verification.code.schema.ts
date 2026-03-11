import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VerificationCodeDocument = VerificationCode & Document;

@Schema({ timestamps: true })
export class VerificationCode {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  code: string; 

  @Prop({ required: true, index: { expireAfterSeconds: 0 } })
  expiresAt: Date; 

  @Prop({ default: false })
  used: boolean;

  @Prop({ default: 0 })
  attempts: number; 
}

export const VerificationCodeSchema =
  SchemaFactory.createForClass(VerificationCode);