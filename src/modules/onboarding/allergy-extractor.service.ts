import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Drug, DrugDocument } from 'src/modules/drug/schemas/drug.schema';
import { AllergySeverity, AllergyType, PatientAllergy, PatientAllergyDocument } from 'src/modules/patient-allergy/schema/patient-allergy.schema';

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


  async extractAndSave(patientId: string, answers: RawAllergyAnswer[]): Promise<void> {

    const allergyNames: string[] = [];
    for (const answer of answers) {
      if (Array.isArray(answer.value)) {
        allergyNames.push(...answer.value.map(String));
      } else if (typeof answer.value === 'string' && answer.value.trim()) {
        allergyNames.push(answer.value.trim());
      }
    }

    if (!allergyNames.length) return;

    const upsertOps = await Promise.all(
      allergyNames.map(async (name) => {
        const normalized = name.toLowerCase().trim();

        const drug = await this.drugModel.findOne({
          $or: [
            { tradeName: { $regex: normalized, $options: 'i' } },
            { genericName: { $regex: normalized, $options: 'i' } },
            { similarTradeNames: { $regex: normalized, $options: 'i' } },
            { activeIngredients: { $regex: normalized, $options: 'i' } },
          ],
        });

        return {
          updateOne: {
            filter: {
              patientId: new Types.ObjectId(patientId),
              name: normalized,
            },
            update: {
              $set: {
                allergyType: drug ? AllergyType.DRUG : AllergyType.INGREDIENT,
                drugRef: drug?._id ?? undefined,
                severity: AllergySeverity.UNKNOWN, 
                confirmedByDoctor: false,
                isActive: true,
              },
            },
            upsert: true,
          },
        };
      }),
    );

    await this.allergyModel.bulkWrite(upsertOps);
  }
}