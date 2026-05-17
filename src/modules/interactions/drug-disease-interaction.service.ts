import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DrugDiseaseInteraction,
  DrugDiseaseInteractionDocument,
  DrugDiseaseRelation,
  InteractionSeverity,
} from './schema/drug-disease-interaction.schema';
import {
  CreateDrugDiseaseInteractionDto,
  UpdateDrugDiseaseInteractionDto,
} from './dtos/drug-disease-interaction.dto';

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
    relation?: DrugDiseaseRelation;
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

  async findForDrug(
    drugId: string,
    relation?: DrugDiseaseRelation,
  ): Promise<DrugDiseaseInteractionDocument[]> {
    const query: Record<string, any> = { drug: new Types.ObjectId(drugId) };
    if (relation) query.relation = relation;

    return this.model
      .find(query)
      .populate('disease', 'name diseaseCode category')
      .sort({ relation: 1, severity: 1 })
      .lean();
  }

  async findForDisease(
    diseaseId: string,
    relation?: DrugDiseaseRelation,
  ): Promise<DrugDiseaseInteractionDocument[]> {
    const query: Record<string, any> = {
      disease: new Types.ObjectId(diseaseId),
    };
    if (relation) query.relation = relation;

    return this.model
      .find(query)
      .populate('drug', 'tradeName genericName form route')
      .sort({ relation: 1, severity: 1 })
      .lean();
  }

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
          $in: [
            DrugDiseaseRelation.CONTRAINDICATION,
            DrugDiseaseRelation.CAUTION,
          ],
        },
      })
      .populate('drug', 'tradeName genericName')
      .populate('disease', 'name')
      .lean();
  }

  async findIndicationsForDrugs(
    drugIds: string[],
  ): Promise<DrugDiseaseInteractionDocument[]> {
    if (!drugIds.length) return [];

    return this.model
      .find({
        drug: { $in: drugIds.map((id) => new Types.ObjectId(id)) },
        relation: DrugDiseaseRelation.INDICATION,
      })
      .populate('disease', 'name diseaseCode')
      .lean();
  }

  async update(
    id: string,
    dto: UpdateDrugDiseaseInteractionDto,
  ): Promise<DrugDiseaseInteractionDocument> {
    const { drug, disease, ...updateData } = dto;

    const doc = await this.model
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate('drug', 'tradeName genericName')
      .populate('disease', 'name');

    if (!doc) throw new NotFoundException('Drug–disease interaction not found');
    return doc;
  }

  async delete(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id);
    if (!result)
      throw new NotFoundException('Drug–disease interaction not found');
  }
}
