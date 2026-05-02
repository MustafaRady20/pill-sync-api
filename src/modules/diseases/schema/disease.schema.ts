import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DiseaseDocument = Disease & Document;

@Schema({ timestamps: true })
export class Disease {
  @Prop({ unique: true, sparse: true, uppercase: true, trim: true })
  diseaseCode?: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: [String], default: [] })
  similarNames: string[];

  @Prop({ type:String, })
  familyCode: string;

  @Prop({ type:String, })
  family: string;

  @Prop({type:String,  })
  parentCode?: string;

  @Prop({type:Number })
  level: number;
}

export const DiseaseSchema = SchemaFactory.createForClass(Disease);

DiseaseSchema.index(
  { name: 'text', similarNames: 'text' },
  { weights: { name: 5, similarNames: 3 } },
);