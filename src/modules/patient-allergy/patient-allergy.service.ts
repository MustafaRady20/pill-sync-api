import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AllergySeverity, AllergyType, PatientAllergy, PatientAllergyDocument } from './schema/patient-allergy.schema';
import { Drug, DrugDocument } from 'src/modules/drug/schemas/drug.schema';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';


export interface AllergyIndexEntry {
  name: string;
  drugRefId: string | null;
  allergyType: AllergyType;
  severity: AllergySeverity;
  confirmedByDoctor: boolean;
  reaction?: string;
}

@Injectable()
export class PatientAllergyService {
  constructor(
    @InjectModel(PatientAllergy.name)
    private allergyModel: Model<PatientAllergyDocument>,
    @InjectModel(Drug.name)
    private drugModel: Model<DrugDocument>,
  ) {}


  async create(
    patientId: string,
    dto: CreateAllergyDto,
    confirmedByDoctor = false,
  ): Promise<PatientAllergyDocument> {
    const normalized = dto.name.toLowerCase().trim();

    const existing = await this.allergyModel.findOne({
      patientId: new Types.ObjectId(patientId),
      name: normalized,
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException(
          `An active allergy for "${normalized}" is already recorded for this patient`,
        );
      }

      existing.isActive = true;
      existing.severity = dto.severity ?? AllergySeverity.UNKNOWN;
      existing.reaction = dto.reaction;
      existing.allergyType = dto.allergyType ?? existing.allergyType;
      existing.confirmedByDoctor = confirmedByDoctor;

      const drug = await this.resolveDrug(normalized);
      existing.drugRef = drug?._id ?? existing.drugRef;
      return existing.save();
    }

    const drug = await this.resolveDrug(normalized);

    if (!drug) {
        throw new NotFoundException(`Drug not found for allergy "${normalized}"`);
    }
    
    return this.allergyModel.create({
      patientId: new Types.ObjectId(patientId),
      name: normalized,
      allergyType: dto.allergyType ?? (drug ? AllergyType.DRUG : AllergyType.INGREDIENT),
      drugRef: drug._id ?? null,
      severity: dto.severity ?? AllergySeverity.UNKNOWN,
      reaction: dto.reaction,
      confirmedByDoctor,
      isActive: true,
    });
  }

  async findAllForPatient(
    patientId: string,
    includeInactive = false,
  ): Promise<PatientAllergyDocument[]> {
    const filter: Record<string, any> = {
      patientId: new Types.ObjectId(patientId),
    };
    if (!includeInactive) filter.isActive = true;

    return this.allergyModel
      .find(filter)
      .populate('drugRef', 'tradeName genericName form route activeIngredients')
      .sort({ severity: 1, confirmedByDoctor: -1, createdAt: -1 })
      .lean();
  }

  async findOne(
    patientId: string,
    allergyId: string,
  ): Promise<PatientAllergyDocument> {
    const allergy = await this.allergyModel
      .findOne({
        _id: new Types.ObjectId(allergyId),
        patientId: new Types.ObjectId(patientId),
      })
      .populate('drugRef', 'tradeName genericName form route activeIngredients');

    if (!allergy) throw new NotFoundException('Allergy record not found');
    return allergy;
  }


  async update(
    patientId: string,
    allergyId: string,
    dto: UpdateAllergyDto,
    confirmedByDoctor = true,
  ): Promise<PatientAllergyDocument> {
    const allergy = await this.findOne(patientId, allergyId);
    const newName = dto.name?.toLowerCase().trim();

    if (newName && newName !== allergy.name) {

      const collision = await this.allergyModel.findOne({
        patientId: new Types.ObjectId(patientId),
        name: newName,
        isActive: true,
        _id: { $ne: new Types.ObjectId(allergyId) },
      });
      if (collision) {
        throw new ConflictException(
          `An active allergy for "${newName}" already exists for this patient`,
        );
      }

      allergy.name = newName;
      const drug = await this.resolveDrug(newName);
      allergy.drugRef = drug?._id ?? undefined;
      allergy.allergyType =
        dto.allergyType ?? (drug ? AllergyType.DRUG : AllergyType.INGREDIENT);
    }

    if (dto.severity !== undefined)    allergy.severity    = dto.severity;
    if (dto.reaction !== undefined)    allergy.reaction    = dto.reaction;
    if (dto.allergyType !== undefined) allergy.allergyType = dto.allergyType;

    allergy.confirmedByDoctor = confirmedByDoctor;

    return allergy.save();
  }


  async deactivate(
    patientId: string,
    allergyId: string,
  ): Promise<PatientAllergyDocument> {
    const allergy = await this.findOne(patientId, allergyId);

    if (!allergy.isActive) {
      throw new ConflictException('Allergy record is already inactive');
    }

    allergy.isActive = false;
    return allergy.save();
  }


  async getActiveAllergyIndex(patientId: string): Promise<AllergyIndexEntry[]> {
    const allergies = await this.allergyModel
      .find({ patientId: new Types.ObjectId(patientId), isActive: true })
      .select('name drugRef allergyType severity confirmedByDoctor reaction')
      .lean();

    return allergies.map((a) => ({
      name: a.name,
      drugRefId: a.drugRef?.toString() ?? null,
      allergyType: a.allergyType,
      severity: a.severity,
      confirmedByDoctor: a.confirmedByDoctor,
      reaction: a.reaction,
    }));
  }


  private async resolveDrug(name: string): Promise<DrugDocument | null> {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.drugModel.findOne({
      $or: [
        { genericName:      { $regex: `^${escaped}$`, $options: 'i' } },
        { tradeName:        { $regex: `^${escaped}$`, $options: 'i' } },
        { similarTradeNames:{ $regex: `^${escaped}$`, $options: 'i' } },
        { activeIngredients:{ $regex: `^${escaped}$`, $options: 'i' } },
      ],
    });
  }
}