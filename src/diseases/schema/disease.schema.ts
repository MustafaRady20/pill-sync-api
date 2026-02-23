import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DiseaseDocument = Disease & Document;

@Schema({ timestamps: true })
export class Disease {

  @Prop({ type: String, unique: true, sparse: true, uppercase: true, trim: true })
  diseaseCode?: string;

  @Prop({ type: String, required: true, index: true, trim: true })
  name: string;

  @Prop({ type: [String], default: [] })
  similarNames: string[];


  @Prop({ type: String })
  category?: string;

  @Prop({ type: String })
  description?: string;
}

export const DiseaseSchema = SchemaFactory.createForClass(Disease);
DiseaseSchema.index({ name: 'text', similarNames: 'text' }); 