import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AllergySeverity, AllergyType, PatientAllergy, PatientAllergyDocument } from './schema/patient-allergy.schema';
import { Drug, DrugDocument } from 'src/drug/schemas/drug.schema';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';


@Injectable()
export class PatientAllergyService {
  constructor(
    @InjectModel(PatientAllergy.name)
    private allergyModel: Model<PatientAllergyDocument>,
    @InjectModel(Drug.name)
    private drugModel: Model<DrugDocument>,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  /**
   * Adds a new allergy record for a patient.
   * Attempts to resolve the allergy name to a Drug document automatically.
   * Throws 409 if the patient already has an active allergy with the same name.
   */
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
          `Patient already has an active allergy recorded for "${normalized}"`,
        );
      }
      // Re-activate a previously deactivated record instead of creating a duplicate
      existing.isActive = true;
      existing.severity = dto.severity ?? AllergySeverity.UNKNOWN;
      existing.reaction = dto.reaction;
      existing.confirmedByDoctor = confirmedByDoctor;
      return existing.save();
    }

    // Try to resolve the name to a Drug document
    const drug = await this.resolveDrug(normalized);

    return this.allergyModel.create({
      patientId: new Types.ObjectId(patientId),
      name: normalized,
      allergyType: dto.allergyType ?? (drug ? AllergyType.DRUG : AllergyType.INGREDIENT),
      drugRef: drug?._id,
      severity: dto.severity ?? AllergySeverity.UNKNOWN,
      reaction: dto.reaction,
      confirmedByDoctor,
      isActive: true,
    });
  }

  // ─── Read ─────────────────────────────────────────────────────────────────

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
      .populate('drugRef', 'tradeName genericName form route')
      .sort({ severity: 1, createdAt: -1 })
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
      .populate('drugRef', 'tradeName genericName form route');

    if (!allergy) throw new NotFoundException('Allergy record not found');
    return allergy;
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  /**
   * Doctor updates severity, reaction description, or allergy type.
   * Also re-attempts drug resolution if the name changed.
   */
  async update(
    patientId: string,
    allergyId: string,
    dto: UpdateAllergyDto,
  ): Promise<PatientAllergyDocument> {
    const allergy = await this.findOne(patientId, allergyId);

    if (dto.name && dto.name.toLowerCase().trim() !== allergy.name) {
      allergy.name = dto.name.toLowerCase().trim();
      const drug = await this.resolveDrug(allergy.name);
      allergy.drugRef = drug?._id ?? undefined;
      allergy.allergyType = dto.allergyType ?? (drug ? AllergyType.DRUG : AllergyType.INGREDIENT);
    }

    if (dto.severity !== undefined) allergy.severity = dto.severity;
    if (dto.reaction !== undefined) allergy.reaction = dto.reaction;
    if (dto.allergyType !== undefined) allergy.allergyType = dto.allergyType;

    // Mark as doctor-confirmed on any doctor update
    allergy.confirmedByDoctor = true;

    return allergy.save();
  }

  // ─── Deactivate / Delete ──────────────────────────────────────────────────

  /**
   * Soft-delete: sets isActive = false.
   * Hard-delete is intentionally not exposed — allergy history must be preserved
   * for audit and retrospective safety analysis.
   */
  async deactivate(
    patientId: string,
    allergyId: string,
  ): Promise<PatientAllergyDocument> {
    const allergy = await this.findOne(patientId, allergyId);
    if (!allergy.isActive) {
      throw new ConflictException('Allergy is already inactive');
    }
    allergy.isActive = false;
    return allergy.save();
  }

  // ─── Safety check helper (used by SafetyCheckService) ────────────────────

  /**
   * Returns all active allergy names + drugRef IDs for a patient.
   * Optimised for the safety check — no population needed, just IDs and names.
   */
  async getActiveAllergyIndex(patientId: string): Promise<
    Array<{
      name: string;
      drugRefId: string | null;
      severity: AllergySeverity;
      reaction?: string;
    }>
  > {
    const allergies = await this.allergyModel
      .find({ patientId: new Types.ObjectId(patientId), isActive: true })
      .select('name drugRef severity reaction')
      .lean();

    return allergies.map((a) => ({
      name: a.name,
      drugRefId: a.drugRef?.toString() ?? null,
      severity: a.severity,
      reaction: a.reaction,
    }));
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Fuzzy-matches an allergy name against the Drug collection.
   * Checks trade name, generic name, similar trade names, and active ingredients.
   */
  private async resolveDrug(name: string): Promise<DrugDocument | null> {
    return this.drugModel.findOne({
      $or: [
        { tradeName: { $regex: name, $options: 'i' } },
        { genericName: { $regex: name, $options: 'i' } },
        { similarTradeNames: { $regex: name, $options: 'i' } },
        { activeIngredients: { $regex: name, $options: 'i' } },
      ],
    });
  }
}