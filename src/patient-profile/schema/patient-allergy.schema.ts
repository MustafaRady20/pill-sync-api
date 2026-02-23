import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PatientAllergyDocument = PatientAllergy & Document;

export enum AllergyType {
  DRUG = 'drug',              // allergy to a specific drug (matched by name/ref)
  INGREDIENT = 'ingredient',  // allergy to an active ingredient (catches all brand variants)
  DRUG_CLASS = 'drug_class',  // allergy to a whole class e.g. "penicillins", "NSAIDs"
}

export enum AllergySeverity {
  MILD = 'mild',          // rash, itching
  MODERATE = 'moderate',  // urticaria, vomiting
  SEVERE = 'severe',      // anaphylaxis, angioedema
  UNKNOWN = 'unknown',    // patient unsure — doctor should confirm
}

/**
 * Dedicated allergy record for a patient.
 *
 * Created from two sources:
 *   1. Automatically — by AllergyExtractorService after onboarding answers are submitted
 *   2. Manually       — by a doctor via POST /patients/:id/allergies
 *
 * Kept separate from PatientAnswer so safety-check queries are fast,
 * explicit, and not dependent on the question key structure.
 */
@Schema({ timestamps: true })
export class PatientAllergy {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  patientId: Types.ObjectId;

  /**
   * Always stored as lowercase + trimmed so lookups are consistent.
   * e.g. "Penicillin" → "penicillin", "NSAIDs" → "nsaids"
   */
  @Prop({ type: String, required: true, trim: true, lowercase: true })
  name: string;

  /**
   * Auto-detected by AllergyExtractorService via fuzzy drug DB lookup.
   * Defaults to DRUG — doctor can correct to INGREDIENT or DRUG_CLASS if needed.
   */
  @Prop({
    type: String,
    enum: AllergyType,
    default: AllergyType.DRUG,
  })
  allergyType: AllergyType;

  /**
   * Populated when the allergy name resolves to a known Drug document.
   * Null if the drug is not yet in the database (name-based matching still applies).
   */
  @Prop({ type: Types.ObjectId, ref: 'Drug', default: null })
  drugRef?: Types.ObjectId;

  @Prop({ type: String, enum: AllergySeverity, default: AllergySeverity.UNKNOWN })
  severity: AllergySeverity;

  /**
   * Free-text description of the reaction the patient experiences.
   * e.g. "hives", "throat swelling", "anaphylactic shock"
   */
  @Prop({ type: String, trim: true })
  reaction?: string;

  /**
   * false  → self-reported during onboarding (lower trust)
   * true   → added or confirmed by a doctor (higher trust, weighted more in safety check)
   */
  @Prop({ type: Boolean, default: false })
  confirmedByDoctor: boolean;

  /**
   * Soft-delete flag.
   * Never hard-deleted — history must be preserved for audit and retrospective analysis.
   * Deactivated records are excluded from safety checks but remain queryable.
   */
  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;
}

export const PatientAllergySchema = SchemaFactory.createForClass(PatientAllergy);

// Fast lookup for safety checks — most common query pattern
PatientAllergySchema.index({ patientId: 1, isActive: 1 });

// Prevent duplicate allergy entries for the same patient + name combination.
// A deactivated record is re-activated instead of creating a new one.
PatientAllergySchema.index({ patientId: 1, name: 1 }, { unique: true });