import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DrugDiseaseInteraction, DrugDiseaseInteractionDocument, InteractionRelation, InteractionSeverity } from './schema/drug-disease-interaction.schema';
import { CreateDrugDiseaseInteractionDto, UpdateDrugDiseaseInteractionDto } from './dto/drug-disease-interaction.dto';


@Injectable()
export class DrugDiseaseService {
  constructor(
    @InjectModel(DrugDiseaseInteraction.name)
    private model: Model<DrugDiseaseInteractionDocument>,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(
    dto: CreateDrugDiseaseInteractionDto,
  ): Promise<DrugDiseaseInteractionDocument> {
    try {
      return await this.model.create({
        drug: new Types.ObjectId(dto.drug),
        disease: new Types.ObjectId(dto.disease),
        relation: dto.relation,
        severity: dto.severity,
        description: dto.description,
        mechanism: dto.mechanism,
        recommendedDose: dto.recommendedDose,
        source: dto.source,
      });
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictException(
          'A drug–disease interaction with this drug, disease, and relation already exists',
        );
      }
      throw err;
    }
  }

  // ─── Read ─────────────────────────────────────────────────────────────────

  async findAll(filters?: {
    relation?: InteractionRelation;
    severity?: InteractionSeverity;
  }): Promise<DrugDiseaseInteractionDocument[]> {
    const query: Record<string, any> = {};
    if (filters?.relation) query.relation = filters.relation;
    if (filters?.severity) query.severity = filters.severity;

    return this.model
      .find(query)
      .populate('drug', 'tradeName genericName form route')
      .populate('disease', 'name diseaseCode category')
      .sort({ severity: 1, createdAt: -1 })
      .lean();
  }

  async findById(id: string): Promise<DrugDiseaseInteractionDocument> {
    const doc = await this.model
      .findById(id)
      .populate('drug', 'tradeName genericName form route')
      .populate('disease', 'name diseaseCode category');
    if (!doc) throw new NotFoundException('Drug–disease interaction not found');
    return doc;
  }

  /**
   * All interactions (any relation) for a given drug.
   * Useful for a drug detail page showing indications + contraindications together.
   */
  async findForDrug(
    drugId: string,
    relation?: InteractionRelation,
  ): Promise<DrugDiseaseInteractionDocument[]> {
    const query: Record<string, any> = { drug: new Types.ObjectId(drugId) };
    if (relation) query.relation = relation;

    return this.model
      .find(query)
      .populate('disease', 'name diseaseCode category')
      .sort({ relation: 1, severity: 1 })
      .lean();
  }

  /**
   * All interactions for a given disease.
   * Useful for a disease detail page showing which drugs treat vs. contraindicate.
   */
  async findForDisease(
    diseaseId: string,
    relation?: InteractionRelation,
  ): Promise<DrugDiseaseInteractionDocument[]> {
    const query: Record<string, any> = { disease: new Types.ObjectId(diseaseId) };
    if (relation) query.relation = relation;

    return this.model
      .find(query)
      .populate('drug', 'tradeName genericName form route')
      .sort({ relation: 1, severity: 1 })
      .lean();
  }

  /**
   * Core method used by SafetyCheckService.
   *
   * Given a list of drugIds and a list of the patient's diseaseIds,
   * returns all CONTRAINDICATION and CAUTION interactions between them.
   * Runs as a single DB query to keep prescription activation fast.
   */
  async findContraindicationsForPatient(
    drugIds: string[],
    diseaseIds: string[],
  ): Promise<DrugDiseaseInteractionDocument[]> {
    if (!drugIds.length || !diseaseIds.length) return [];

    return this.model
      .find({
        drug: { $in: drugIds.map((id) => new Types.ObjectId(id)) },
        disease: { $in: diseaseIds.map((id) => new Types.ObjectId(id)) },
        relation: {
          $in: [InteractionRelation.CONTRAINDICATION, InteractionRelation.CAUTION],
        },
      })
      .populate('drug', 'tradeName genericName')
      .populate('disease', 'name')
      .lean();
  }

  /**
   * Returns all INDICATION interactions for a drug list.
   * Used to suggest what diseases a drug is approved to treat.
   */
  async findIndicationsForDrugs(
    drugIds: string[],
  ): Promise<DrugDiseaseInteractionDocument[]> {
    if (!drugIds.length) return [];

    return this.model
      .find({
        drug: { $in: drugIds.map((id) => new Types.ObjectId(id)) },
        relation: InteractionRelation.INDICATION,
      })
      .populate('disease', 'name diseaseCode')
      .lean();
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  /**
   * Drug and disease refs are immutable after creation.
   * Only clinical metadata (severity, description, mechanism, etc.) can be updated.
   */
  async update(
    id: string,
    dto: UpdateDrugDiseaseInteractionDto,
  ): Promise<DrugDiseaseInteractionDocument> {
    // Strip immutable ref fields
    const { drug, disease, ...updateData } = dto;

    const doc = await this.model
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate('drug', 'tradeName genericName')
      .populate('disease', 'name');

    if (!doc) throw new NotFoundException('Drug–disease interaction not found');
    return doc;
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async delete(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Drug–disease interaction not found');
  }
}