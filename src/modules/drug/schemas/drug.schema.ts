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
  @Prop({ required: true, index: true })
  senomeCode: string;

  @Prop({ required: true, index: true })
  tradeName: string;

  @Prop({ required: true, index: true })
  genericName: string;

  @Prop({ type: [String], default: [], index: true })
  synonyms: string[];

  @Prop({ type: [String], default: [], index: true })
  similarTradeNames: string[];

  @Prop({ type: [{ name: String, strength: String }], default: [] })
  activeIngredients: { name: string; strength?: string }[];

  @Prop({ required: true })
  dose: string;

  @Prop()
  strength?: string;

  @Prop({ enum: DrugForm, required: true })
  form: DrugForm;

  @Prop({ enum: DrugRoute, required: true })
  route: DrugRoute;

  @Prop({ type: [String], default: [] })
  dosageInstructions: string[];

  @Prop()
  manufacturer?: string;

  @Prop()
  atcCode?: string;

  @Prop()
  registrationNumber?: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  indications: string[];

  @Prop({ type: [String], default: [] })
  contraindications: string[];

  @Prop({ type: [String], default: [] })
  warnings: string[];

  @Prop({ type: [String], default: [] })
  precautions: string[];

  // ⚠️ Safety
  @Prop({ type: [String], default: [] })
  sideEffects: string[];

  @Prop({ type: [String], default: [] })
  interactions: string[];

  @Prop({ type: [String], default: [] })
  lifestyleInteractions: string[];

  @Prop()
  mechanismOfAction?: string;

  @Prop()
  pharmacokinetics?: string;

  @Prop({ type: Object })
  rawData?: Record<string, any>;
}

export const DrugSchema = SchemaFactory.createForClass(Drug);
DrugSchema.index({ genericName: 1, form: 1 });
DrugSchema.index({
  tradeName: 'text',
  genericName: 'text',
  similarTradeNames: 'text',
});
