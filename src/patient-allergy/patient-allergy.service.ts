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

  // ─── Create ───────────────────────────────────────────────────────────────

  /**
   * Creates a new PatientAllergy record.
   *
   * Logic:
   *  1. Normalize name to lowercase + trim
   *  2. Check if record already exists for this patient + name:
   *     - Active  → throw 409
   *     - Inactive → re-activate with new values (preserves history)
   *  3. Fuzzy-resolve name against Drug collection
   *  4. Insert with allergyType auto-detected if not provided
   *
   * @param confirmedByDoctor  true when called from DoctorAllergyController,
   *                           false when called from MyAllergyController (self-report)
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
          `An active allergy for "${normalized}" is already recorded for this patient`,
        );
      }
      // Re-activate deactivated record — avoids duplicate, preserves createdAt history
      existing.isActive = true;
      existing.severity = dto.severity ?? AllergySeverity.UNKNOWN;
      existing.reaction = dto.reaction;
      existing.allergyType = dto.allergyType ?? existing.allergyType;
      existing.confirmedByDoctor = confirmedByDoctor;
      // Re-run drug resolution in case DB was updated since deactivation
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

  // ─── Update ───────────────────────────────────────────────────────────────

  /**
   * Updates an allergy record. Any update by a doctor auto-sets confirmedByDoctor = true.
   *
   * If name changes:
   *  - Guard against collision with another active record for the same name
   *  - Re-run drug resolution for the new name
   *  - Update allergyType unless explicitly overridden in dto
   */
  async update(
    patientId: string,
    allergyId: string,
    dto: UpdateAllergyDto,
    confirmedByDoctor = true,
  ): Promise<PatientAllergyDocument> {
    const allergy = await this.findOne(patientId, allergyId);
    const newName = dto.name?.toLowerCase().trim();

    if (newName && newName !== allergy.name) {
      // Guard: ensure new name doesn't collide with another active record
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

  // ─── Deactivate ───────────────────────────────────────────────────────────

  /**
   * Soft-delete: sets isActive = false.
   *
   * Hard-delete is intentionally NOT exposed — allergy history must be
   * preserved for audit trails and retrospective safety analysis.
   * A deactivated record can be re-activated via create() with the same name.
   */
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

  // ─── Safety check helper ──────────────────────────────────────────────────

  /**
   * Lightweight method called by SafetyCheckService during prescription activation.
   *
   * Returns the minimal fields needed for the allergy check:
   *   - name             → matched against drug trade/generic/ingredient names
   *   - drugRefId        → matched directly against Drug._id for exact hits
   *   - allergyType      → DRUG_CLASS entries can trigger class-wide matching
   *   - severity         → included in warning payload for doctor review
   *   - confirmedByDoctor → used to weight severity in SafetyCheckService
   *
   * No population — raw ObjectIds only, keeping this query as fast as possible.
   */
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

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Fuzzy-matches a normalized allergy name against the Drug collection.
   *
   * Match priority (most → least specific):
   *   1. genericName  exact match  (case-insensitive)
   *   2. tradeName    exact match
   *   3. similarTradeNames  array member exact match
   *   4. activeIngredients  array member exact match
   *
   * Anchored regex (^name$) prevents partial matches like "cillin" matching "amoxicillin".
   * Returns null if not found — does NOT block saving the allergy.
   */
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