import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DrugDocument = Drug & Document;

@Schema({ timestamps: true })
export class Drug {
  @Prop({ type: Types.ObjectId, required: true })
  durg_a: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  durg_b: Types.ObjectId;

  @Prop({ type: String, required: true })
  relation: string;


}

export const DrugSchema = SchemaFactory.createForClass(Drug);
