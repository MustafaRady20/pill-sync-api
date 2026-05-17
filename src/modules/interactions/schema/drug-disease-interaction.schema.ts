import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DrugDiseaseInteractionDocument = DrugDiseaseInteraction & Document;

export enum DrugDiseaseRelation {
  INDICATION = 'indication',
  SIDE_EFFECT = 'side_effect',
  CONTRAINDICATION = 'contraindication',
  CAUTION = 'caution',
  SAFE = 'safe',
}

export enum InteractionSeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  CONTRAINDICATED = 'contraindicated',
}

@Schema({ timestamps: true })
export class DrugDiseaseInteraction {
  @Prop({ type: Types.ObjectId, ref: 'Drug', required: true, index: true })
  drug: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Disease', required: true, index: true })
  disease: Types.ObjectId;

  @Prop({ type: String, required: true, enum: DrugDiseaseRelation })
  relation: DrugDiseaseRelation;

  @Prop({ type: String, required: true, enum: InteractionSeverity })
  severity: InteractionSeverity;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  recommendedDose?: string;

  @Prop({ type: String })
  reasoning?: string;

  @Prop({ type: String })
  source?: string;

  /**
   * For contraindications/side-effects: mechanism of the negative interaction
   * e.g. "nephrotoxicity", "QT prolongation"
   */
  @Prop({ type: String })
  mechanism?: string;
}

export const DrugDiseaseInteractionSchema = SchemaFactory.createForClass(
  DrugDiseaseInteraction,
);

DrugDiseaseInteractionSchema.index(
  { drug: 1, disease: 1, relation: 1 },
  { unique: true },
);
