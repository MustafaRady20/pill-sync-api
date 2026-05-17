import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Drug, DrugDocument } from './schemas/drug.schema';
import { CreateDrugDto } from './dto/create-drug.dto';
import { UpdateDrugDto } from './dto/update-drug.dto';
import { CacheService } from '../../common/cache/cache.service';

@Injectable()
export class DrugService {
  constructor(
    @InjectModel(Drug.name)
    private readonly drugModel: Model<DrugDocument>,
    private readonly cacheService: CacheService,
  ) {}

  async create(dto: Partial<DrugDocument>): Promise<Drug> {
    const drug = await this.drugModel.create(dto);

    await this.cacheService.del('drugs:list');

    return drug;
  }

  async findAll(): Promise<Drug[]> {
    return this.cacheService.getOrSet(
      'drugs:list',
      async () => {
        return this.drugModel.find().sort({ tradeName: 1 }).lean();
      },
      300,
    );
  }

  async findByTradeName(name: string): Promise<Drug[]> {
    return this.drugModel
      .find({
        $or: [
          { tradeName: new RegExp(name, 'i') },
          { similarTradeNames: new RegExp(name, 'i') },
        ],
      })
      .lean();
  }

  async findOne(id: string): Promise<Drug> {
    const cacheKey = `drug:${id}`;

    const cached = await this.cacheService.get<Drug>(cacheKey);

    if (cached) {
      return cached;
    }

    const drug = await this.drugModel.findById(id).lean();

    if (!drug) {
      throw new NotFoundException('Drug not found');
    }

    await this.cacheService.set(cacheKey, drug, 600);

    return drug;
  }

  async update(id: string, dto: UpdateDrugDto): Promise<Drug> {
    const drug = await this.drugModel
      .findByIdAndUpdate(id, dto, {
        new: true,
      })
      .lean();

    if (!drug) {
      throw new NotFoundException('Drug not found');
    }

    await this.cacheService.del(`drug:${id}`);
    await this.cacheService.del('drugs:list');

    return drug;
  }

  async remove(id: string): Promise<void> {
    const res = await this.drugModel.findByIdAndDelete(id);

    if (!res) {
      throw new NotFoundException('Drug not found');
    }

    await this.cacheService.del(`drug:${id}`);
    await this.cacheService.del('drugs:list');
  }
}
