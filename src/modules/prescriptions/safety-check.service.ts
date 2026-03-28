import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Drug, DrugDocument } from 'src/modules/drug/schemas/drug.schema';
import { DrugDiseaseInteraction, DrugDiseaseInteractionDocument, InteractionRelation } from 'src/modules/interactions/schema/drug-disease-interaction.schema';
import { DrugDrugInteraction, DrugDrugInteractionDocument } from 'src/modules/interactions/schema/drug-drug-interaction.schema';
import { PatientAllergy, PatientAllergyDocument } from 'src/modules/patient-allergy/schema/patient-allergy.schema';
import { DrugInteractionSeverity } from '../interactions/enums/relations.enum';




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
  passed: boolean;                    
  allergyWarnings: AllergyWarning[];
  drugDrugWarnings: DrugDrugWarning[];
  drugDiseaseWarnings: DrugDiseaseWarning[];
}


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

  private async checkDrugDrugInteractions(
    drugIds: Types.ObjectId[],
  ): Promise<DrugDrugWarning[]> {
    if (drugIds.length < 2) return [];

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


  private async checkDrugDiseaseInteractions(
    patientId: string,
    drugIds: Types.ObjectId[],
  ): Promise<DrugDiseaseWarning[]> {

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


  private async getPatientDiseaseIds(_patientId: string): Promise<Types.ObjectId[]> {
    // TODO: inject PatientDisease model and query here
    return [];
  }
}