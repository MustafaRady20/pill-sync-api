import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DrugDrugInteractionDocument = DrugDrugInteraction & Document;

export enum DrugInteractionSeverity {
  MINOR = 'minor',       
  MODERATE = 'moderate', 
  MAJOR = 'major',       
}


export enum DrugInteractionRelation {
  MINOR = 'Indication',       
  MODERATE = 'moderate', 
  MAJOR = 'major',       
}



@Schema({ timestamps: true })
export class DrugDrugInteraction {

  @Prop({ type: Types.ObjectId, ref: 'Drug', required: true, index: true })
  drug_a: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Drug', required: true, index: true })
  drug_b: Types.ObjectId;

  @Prop({ type: String, required: true, enum: DrugInteractionSeverity })
  severity: DrugInteractionSeverity;

  @Prop({ type: String, required: true })
  description: string;

  /**
   * Pharmacological mechanism (e.g. "CYP3A4 inhibition", "additive CNS depression")
   */
  @Prop({ type: String })
  mechanism?: string;

  /**
   * Clinical management advice (e.g. "monitor INR weekly", "reduce dose by 50%")
   */
  @Prop({ type: String })
  managementAdvice?: string;

  @Prop({ type: String })
  source?: string;
}

export const DrugDrugInteractionSchema = SchemaFactory.createForClass(DrugDrugInteraction);

DrugDrugInteractionSchema.index({ drug_a: 1, drug_b: 1 }, { unique: true });