import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDiseaseDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';
import { Disease, DiseaseDocument } from './schema/disease.schema';

@Injectable()
export class DiseaseService {
  constructor(
    @InjectModel(Disease.name)
    private readonly diseaseModel: Model<DiseaseDocument>,
  ) {}

  async create(dto: CreateDiseaseDto) {
    try {
      return await this.diseaseModel.create(dto);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Disease code must be unique');
      }
      throw error;
    }
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { similarNames: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.diseaseModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.diseaseModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const disease = await this.diseaseModel.findById(id);
    if (!disease) throw new NotFoundException('Disease not found');
    return disease;
  }

  async update(id: string, dto: UpdateDiseaseDto) {
    const updated = await this.diseaseModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    );

    if (!updated) throw new NotFoundException('Disease not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.diseaseModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Disease not found');

    return { message: 'Disease deleted successfully' };
  }
}