import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Drug, DrugDocument } from 'src/drug/schemas/drug.schema';
import { AllergySeverity, AllergyType, PatientAllergy, PatientAllergyDocument } from 'src/patient-allergy/schema/patient-allergy.schema';
// import {
//   PatientAllergy,
//   PatientAllergyDocument,
//   AllergyType,
//   AllergySeverity,
// } from '../../database/schemas/patient-allergy.schema';
// import { Drug, DrugDocument } from '../../database/schemas/drug.schema';

interface RawAllergyAnswer {
  questionKey: string;
  value: string | string[];
}

@Injectable()
export class AllergyExtractorService {
  constructor(
    @InjectModel(PatientAllergy.name)
    private allergyModel: Model<PatientAllergyDocument>,
    @InjectModel(Drug.name)
    private drugModel: Model<DrugDocument>,
  ) {}

  /**
   * Takes raw onboarding answers from allergy-category questions,
   * resolves drug references where possible, and upserts PatientAllergy records.
   *
   * Example answers this handles:
   *   { questionKey: 'known_allergies', value: ['Penicillin', 'Aspirin'] }
   *   { questionKey: 'allergy_severity', value: 'severe' }
   */
  // async extractAndSave(patientId: string, answers: RawAllergyAnswer[]): Promise<void> {
  //   // Collect all drug/ingredient names mentioned
  //   const allergyNames: string[] = [];
  //   for (const answer of answers) {
  //     if (Array.isArray(answer.value)) {
  //       allergyNames.push(...answer.value.map(String));
  //     } else if (typeof answer.value === 'string' && answer.value.trim()) {
  //       allergyNames.push(answer.value.trim());
  //     }
  //   }

  //   if (!allergyNames.length) return;

  //   // Try to resolve each name to a Drug document
  //   const upsertOps = await Promise.all(
  //     allergyNames.map(async (name) => {
  //       const normalized = name.toLowerCase().trim();

  //       // Fuzzy match against drug trade names, generic names, and similar names
  //       const drug = await this.drugModel.findOne({
  //         $or: [
  //           { tradeName: { $regex: normalized, $options: 'i' } },
  //           { genericName: { $regex: normalized, $options: 'i' } },
  //           { similarTradeNames: { $regex: normalized, $options: 'i' } },
  //           { activeIngredients: { $regex: normalized, $options: 'i' } },
  //         ],
  //       });

  //       return {
  //         updateOne: {
  //           filter: {
  //             patientId: new Types.ObjectId(patientId),
  //             name: normalized,
  //           },
  //           update: {
  //             $set: {
  //               allergyType: drug ? AllergyType.DRUG : AllergyType.INGREDIENT,
  //               drugRef: drug?._id ?? null,
  //               severity: AllergySeverity.UNKNOWN, // doctor can update later
  //               confirmedByDoctor: false,
  //               isActive: true,
  //             },
  //           },
  //           upsert: true,
  //         },
  //       };
  //     }),
  //   );

  //   await this.allergyModel.bulkWrite(upsertOps);
  // }
}