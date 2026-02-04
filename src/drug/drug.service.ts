import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Drug, DrugDocument } from './schemas/drug.schema';
import { CreateDrugDto } from './dto/create-drug.dto';
import { UpdateDrugDto } from './dto/update-drug.dto';

@Injectable()
export class DrugService {
  constructor(
    @InjectModel(Drug.name)
    private readonly drugModel: Model<DrugDocument>,
  ) {}

  async create(dto: CreateDrugDto): Promise<Drug> {
    return this.drugModel.create(dto);
  }

  async findAll(): Promise<Drug[]> {
    return this.drugModel.find().sort({ tradeName: 1 });
  }

  async findByTradeName(name: string): Promise<Drug[]> {
    return this.drugModel.find({
      $or: [
        { tradeName: new RegExp(name, 'i') },
        { similarTradeNames: new RegExp(name, 'i') },
      ],
    });
  }

  async findOne(id: string): Promise<Drug> {
    const drug = await this.drugModel.findById(id);
    if (!drug) throw new NotFoundException('Drug not found');
    return drug;
  }

  async update(id: string, dto: UpdateDrugDto): Promise<Drug> {
    const drug = await this.drugModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!drug) throw new NotFoundException('Drug not found');
    return drug;
  }

  async remove(id: string): Promise<void> {
    const res = await this.drugModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Drug not found');
  }
}
