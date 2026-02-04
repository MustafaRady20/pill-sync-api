import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DrugDocument = Drug & Document;

@Schema({ timestamps: true })
export class Drug {
  @Prop({ type: String, required: true, unique: true })
  senomeCode: string;

  @Prop({ type: String, required: true, index: true })
  tradeName: string;

  @Prop({ type: String, required: true })
  genericName: string;

  @Prop({ type: String, required: true })
  dose: string; // مثال: 500mg

  @Prop({ type: String, required: true })
  strength: string; // مثال: strong / weak أو 500mg/5ml

  @Prop({ type: String, required: true })
  form: string; // tablet, syrup, injection

  @Prop({ type: String, required: true })
  route: string; // oral, IV, IM

  @Prop({ type: String })
  manufacturer: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: [String], default: [] })
  similarTradeNames: string[];
}

export const DrugSchema = SchemaFactory.createForClass(Drug);
