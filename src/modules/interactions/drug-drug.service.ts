import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DrugDrugInteraction, DrugDrugInteractionDocument } from './schema/drug-drug-interaction.schema';
import { CreateDrugDrugInteractionDto, UpdateDrugDrugInteractionDto } from './dtos/drug-drug-interaction.dto';

@Injectable()
export class DrugDrugService {
  constructor(
    @InjectModel(DrugDrugInteraction.name)
    private model: Model<DrugDrugInteractionDocument>,
  ) {}


  async create(dto: CreateDrugDrugInteractionDto): Promise<DrugDrugInteractionDocument> {
    if (dto.drug_a === dto.drug_b) {
      throw new BadRequestException('drug_a and drug_b must be different drugs');
    }

    const [drug_a, drug_b] = this.sortPair(dto.drug_a, dto.drug_b);

    try {
      return await this.model.create({
        drug_a,
        drug_b,
        severity: dto.severity,
        description: dto.description,
        mechanism: dto.mechanism,
        managementAdvice: dto.managementAdvice,
        source: dto.source,
      });
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictException(
          'A drug–drug interaction between these two drugs already exists',
        );
      }
      throw err;
    }
  }


  async findAll(): Promise<DrugDrugInteractionDocument[]> {
    return this.model
      .find()
      .populate('drug_a', 'tradeName genericName form route')
      .populate('drug_b', 'tradeName genericName form route')
      .sort({ severity: 1, createdAt: -1 })
      .lean();
  }

  async findById(id: string): Promise<DrugDrugInteractionDocument> {
    const doc = await this.model
      .findById(id)
      .populate('drug_a', 'tradeName genericName form route')
      .populate('drug_b', 'tradeName genericName form route');
    if (!doc) throw new NotFoundException('Drug–drug interaction not found');
    return doc;
  }

  async findForDrug(drugId: string): Promise<DrugDrugInteractionDocument[]> {
    const id = new Types.ObjectId(drugId);
    return this.model
      .find({ $or: [{ drug_a: id }, { drug_b: id }] })
      .populate('drug_a', 'tradeName genericName form route')
      .populate('drug_b', 'tradeName genericName form route')
      .sort({ severity: 1 })
      .lean();
  }

 
  async findForPair(
    drugIdA: string,
    drugIdB: string,
  ): Promise<DrugDrugInteractionDocument | null> {
    const [a, b] = this.sortPair(drugIdA, drugIdB);
    return this.model
      .findOne({ drug_a: a, drug_b: b })
      .populate('drug_a', 'tradeName genericName')
      .populate('drug_b', 'tradeName genericName')
      .lean();
  }


  async findForDrugList(drugIds: string[]): Promise<DrugDrugInteractionDocument[]> {
    if (drugIds.length < 2) return [];
    const objectIds = drugIds.map((id) => new Types.ObjectId(id));
    return this.model
      .find({
        drug_a: { $in: objectIds },
        drug_b: { $in: objectIds },
      })
      .populate('drug_a', 'tradeName genericName')
      .populate('drug_b', 'tradeName genericName')
      .lean();
  }


  async update(
    id: string,
    dto: UpdateDrugDrugInteractionDto,
  ): Promise<DrugDrugInteractionDocument> {

    const { drug_a, drug_b, ...updateData } = dto;

    const doc = await this.model.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    )
      .populate('drug_a', 'tradeName genericName')
      .populate('drug_b', 'tradeName genericName');

    if (!doc) throw new NotFoundException('Drug–drug interaction not found');
    return doc;
  }


  async delete(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Drug–drug interaction not found');
  }


  private sortPair(a: string, b: string): [Types.ObjectId, Types.ObjectId] {
    const oidA = new Types.ObjectId(a);
    const oidB = new Types.ObjectId(b);
    return oidA.toString() < oidB.toString() ? [oidA, oidB] : [oidB, oidA];
  }
}