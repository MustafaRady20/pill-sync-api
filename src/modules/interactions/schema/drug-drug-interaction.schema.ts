import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InteractionRelation } from './drug-disease-interaction.schema';
import { DrugInteractionSeverity } from '../enums/relations.enum';

export type DrugDrugInteractionDocument = DrugDrugInteraction & Document;


@Schema({ timestamps: true })
export class DrugDrugInteraction {

  @Prop({ type: Types.ObjectId, ref: 'Drug', required: true, index: true })
  drug_a: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Drug', required: true, index: true })
  drug_b: Types.ObjectId;

  @Prop({ type: String, required: true, enum: InteractionRelation })
    relation: InteractionRelation;

  @Prop({ type: String, required: true, enum: DrugInteractionSeverity })
  severity: DrugInteractionSeverity;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String })
  mechanism?: string;

  @Prop({ type: String })
  managementAdvice?: string;

  @Prop({ type: String })
  source?: string;
}

export const DrugDrugInteractionSchema = SchemaFactory.createForClass(DrugDrugInteraction);

DrugDrugInteractionSchema.index({ drug_a: 1, drug_b: 1 }, { unique: true });