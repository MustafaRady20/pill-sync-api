import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PatientAllergyDocument = PatientAllergy & Document;

export enum AllergyType {
  DRUG = 'drug',             
  INGREDIENT = 'ingredient',  
  DRUG_CLASS = 'drug_class',  
}

export enum AllergySeverity {
  MILD = 'mild',          // rash, itching
  MODERATE = 'moderate',  // urticaria, vomiting
  SEVERE = 'severe',      // anaphylaxis, angioedema
  UNKNOWN = 'unknown',    // patient unsure — doctor should confirm
}


@Schema({ timestamps: true })
export class PatientAllergy {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  patientId: Types.ObjectId;

 
  @Prop({ type: String, required: true, trim: true, lowercase: true })
  name: string;

  @Prop({
    type: String,
    enum: AllergyType,
    default: AllergyType.DRUG,
  })
  allergyType: AllergyType;


  @Prop({ type: Types.ObjectId, ref: 'Drug', default: null })
  drugRef?: Types.ObjectId;

  @Prop({ type: String, enum: AllergySeverity, default: AllergySeverity.UNKNOWN })
  severity: AllergySeverity;


  @Prop({ type: String, trim: true })
  reaction?: string;

 
  @Prop({ type: Boolean, default: false })
  confirmedByDoctor: boolean;

  
  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;
}

export const PatientAllergySchema = SchemaFactory.createForClass(PatientAllergy);

PatientAllergySchema.index({ patientId: 1, isActive: 1 });

PatientAllergySchema.index({ patientId: 1, name: 1 }, { unique: true });