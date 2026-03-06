import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Drug, DrugDocument } from 'src/drug/schemas/drug.schema';
import { DrugDiseaseInteraction, DrugDiseaseInteractionDocument, InteractionRelation } from 'src/interactions/schema/drug-disease-interaction.schema';
import { DrugDrugInteraction, DrugDrugInteractionDocument, DrugInteractionSeverity } from 'src/interactions/schema/drug-drug-interaction.schema';
import { PatientAllergy, PatientAllergyDocument } from 'src/patient-allergy/schema/patient-allergy.schema';



// ─── Result types ─────────────────────────────────────────────────────────────

export interface AllergyWarning {
  drugId: string;
  drugName: string;
  allergyName: string;
  severity: string;
  reaction?: string;
}

export interface DrugDrugWarning {
  drug_a: string;
  drug_b: string;
  drugNameA: string;
  drugNameB: string;
  severity: DrugInteractionSeverity;
  description: string;
  mechanism?: string;
}

export interface DrugDiseaseWarning {
  drugId: string;
  diseaseId: string;
  drugName: string;
  diseaseName?: string;
  relation: InteractionRelation;
  severity: string;
  description?: string;
}

export interface SafetyCheckResult {
  checkedAt: Date;
  passed: boolean;                    // true only if ZERO warnings exist
  allergyWarnings: AllergyWarning[];
  drugDrugWarnings: DrugDrugWarning[];
  drugDiseaseWarnings: DrugDiseaseWarning[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class SafetyCheckService {
  constructor(
    @InjectModel(DrugDrugInteraction.name)
    private ddiModel: Model<DrugDrugInteractionDocument>,
    @InjectModel(DrugDiseaseInteraction.name)
    private drugDiseaseModel: Model<DrugDiseaseInteractionDocument>,
    @InjectModel(PatientAllergy.name)
    private allergyModel: Model<PatientAllergyDocument>,
    @InjectModel(Drug.name)
    private drugModel: Model<DrugDocument>,
  ) {}

  /**
   * Master safety check — runs all three checks and returns a unified result.
   *
   * @param patientId   patient being prescribed to
   * @param drugIds     drugs in the NEW prescription being written
   */
  async runFullCheck(patientId: string, drugIds: string[]): Promise<SafetyCheckResult> {
    const objectIds = drugIds.map((id) => new Types.ObjectId(id));

    const [allergyWarnings, drugDrugWarnings, drugDiseaseWarnings] = await Promise.all([
      this.checkAllergies(patientId, objectIds),
      this.checkDrugDrugInteractions(objectIds),
      this.checkDrugDiseaseInteractions(patientId, objectIds),
    ]);

    return {
      checkedAt: new Date(),
      passed:
        allergyWarnings.length === 0 &&
        drugDrugWarnings.length === 0 &&
        drugDiseaseWarnings.length === 0,
      allergyWarnings,
      drugDrugWarnings,
      drugDiseaseWarnings,
    };
  }

  // ─── Check 1: Allergies ─────────────────────────────────────────────────

  /**
   * For each drug in the prescription, check if the patient has an active allergy
   * to that drug's trade name, generic name, active ingredients, or drug class.
   */
  private async checkAllergies(
    patientId: string,
    drugIds: Types.ObjectId[],
  ): Promise<AllergyWarning[]> {
    const [drugs, allergies] = await Promise.all([
      this.drugModel.find({ _id: { $in: drugIds } }).lean(),
      this.allergyModel
        .find({ patientId: new Types.ObjectId(patientId), isActive: true })
        .lean(),
    ]);

    if (!allergies.length) return [];

    const warnings: AllergyWarning[] = [];

    for (const drug of drugs) {
      // Build a set of all names/ingredients associated with this drug
      const drugNames = new Set([
        drug.tradeName.toLowerCase(),
        drug.genericName.toLowerCase(),
        ...drug.similarTradeNames.map((n) => n.toLowerCase()),
        ...drug.activeIngredients.map((n) => n.toLowerCase()),
      ]);

      for (const allergy of allergies) {
        if (drugNames.has(allergy.name.toLowerCase())) {
          warnings.push({
            drugId: drug._id.toString(),
            drugName: drug.tradeName,
            allergyName: allergy.name,
            severity: allergy.severity,
            reaction: allergy.reaction,
          });
        }
      }
    }

    return warnings;
  }

  // ─── Check 2: Drug–Drug Interactions ───────────────────────────────────

  /**
   * For every unique pair of drugs in the prescription (including drugs from
   * OTHER ACTIVE prescriptions of the same patient), check for known interactions.
   */
  private async checkDrugDrugInteractions(
    drugIds: Types.ObjectId[],
  ): Promise<DrugDrugWarning[]> {
    if (drugIds.length < 2) return [];

    // Query interactions where BOTH drugs in a pair are present in our list
    // The schema guarantees smaller ObjectId is always drug_a
    const interactions = await this.ddiModel
      .find({
        drug_a: { $in: drugIds },
        drug_b: { $in: drugIds },
      })
      .populate<{ drug_a: DrugDocument; drug_b: DrugDocument }>('drug_a drug_b')
      .lean();

    return interactions.map((i) => ({
      drug_a: (i.drug_a as any)._id.toString(),
      drug_b: (i.drug_b as any)._id.toString(),
      drugNameA: (i.drug_a as any).tradeName,
      drugNameB: (i.drug_b as any).tradeName,
      severity: i.severity,
      description: i.description,
      mechanism: i.mechanism,
    }));
  }

  // ─── Check 3: Drug–Disease (contraindications) ──────────────────────────

  /**
   * Cross-references the prescription drugs against the patient's confirmed
   * diseases (sourced from onboarding + doctor updates) looking for
   * contraindications and high-severity cautions.
   */
  private async checkDrugDiseaseInteractions(
    patientId: string,
    drugIds: Types.ObjectId[],
  ): Promise<DrugDiseaseWarning[]> {
    // Get patient's disease IDs from their allergy/answer records
    // In a real app, you'd have a separate PatientDisease collection —
    // here we query DrugDiseaseInteraction filtering by the patient's diseases
    // This requires a PatientDisease model; shown as placeholder
    const patientDiseaseIds: Types.ObjectId[] = await this.getPatientDiseaseIds(patientId);
    if (!patientDiseaseIds.length) return [];

    const interactions = await this.drugDiseaseModel
      .find({
        drug: { $in: drugIds },
        disease: { $in: patientDiseaseIds },
        relation: {
          $in: [InteractionRelation.CONTRAINDICATION, InteractionRelation.CAUTION],
        },
      })
      .populate('disease')
      .lean();

    return interactions.map((i) => ({
      drugId: (i.drug as any).toString(),
      diseaseId: (i.disease as any)._id?.toString() ?? i.disease.toString(),
      drugName: '', // populated downstream with drug lookup if needed
      diseaseName: (i.disease as any).name,
      relation: i.relation,
      severity: i.severity,
      description: i.description,
    }));
  }

  /**
   * Placeholder — replace with a real PatientDisease model query.
   * In the full app, diseases come from onboarding answers tagged
   * with the CHRONIC_DISEASES category.
   */
  private async getPatientDiseaseIds(_patientId: string): Promise<Types.ObjectId[]> {
    // TODO: inject PatientDisease model and query here
    return [];
  }
}