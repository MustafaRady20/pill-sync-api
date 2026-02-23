import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DrugDocument = Drug & Document;

export enum DrugForm {
  TABLET = 'tablet',
  CAPSULE = 'capsule',
  SYRUP = 'syrup',
  INJECTION = 'injection',
  CREAM = 'cream',
  DROPS = 'drops',
  PATCH = 'patch',
  INHALER = 'inhaler',
  SUPPOSITORY = 'suppository',
  OTHER = 'other',
}

export enum DrugRoute {
  ORAL = 'oral',
  INTRAVENOUS = 'IV',
  INTRAMUSCULAR = 'IM',
  SUBCUTANEOUS = 'SC',
  TOPICAL = 'topical',
  INHALATION = 'inhalation',
  RECTAL = 'rectal',
  SUBLINGUAL = 'sublingual',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Drug {
  @Prop({ type: String, required: true, unique: true, index: true, trim: true })
  senomeCode: string;

  @Prop({ type: String, required: true, index: true, trim: true })
  tradeName: string;

  @Prop({ type: String, required: true, index: true, trim: true })
  genericName: string;

  /**
   * Dose per unit, e.g. "500mg", "10mg/5ml"
   */
  @Prop({ type: String, required: true })
  dose: string;

  /**
   * Concentration/strength descriptor, e.g. "500mg/5ml", "high", "low"
   */
  @Prop({ type: String, required: true })
  strength: string;

  @Prop({ type: String, required: true, enum: DrugForm })
  form: DrugForm;

  @Prop({ type: String, required: true, enum: DrugRoute })
  route: DrugRoute;

  @Prop({ type: String, trim: true })
  manufacturer?: string;

  @Prop({ type: String })
  description?: string;

  /**
   * Other brand names for the same compound (for fuzzy lookup / duplicate prevention)
   */
  @Prop({ type: [String], default: [], index: true })
  similarTradeNames: string[];

  /**
   * Active ingredient IDs — helps detect allergy conflicts across different brand names
   */
  @Prop({ type: [String], default: [] })
  activeIngredients: string[];

  /**
   * ATC code for pharmacological classification (useful for interaction grouping)
   */
  @Prop({ type: String })
  atcCode?: string;
}

export const DrugSchema = SchemaFactory.createForClass(Drug);
DrugSchema.index({ genericName: 1, form: 1 });
DrugSchema.index({ tradeName: 'text', genericName: 'text', similarTradeNames: 'text' }); 