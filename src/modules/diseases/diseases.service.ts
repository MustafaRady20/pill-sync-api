// disease.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { Disease } from './schema/disease.schema';

const FAMILY_MAP = {
  CV: 'Cardiovascular diseases',
  EN: 'Endocrinal disease',
};

@Injectable()
export class DiseaseService {
  constructor(
    @InjectModel(Disease.name)
    private diseaseModel: Model<Disease>,
  ) {}

  async findAll(){
    return this.diseaseModel.find().exec();
  }

  // 🧠 Helpers
  private getLevel(code: string) {
    if (code.length === 2) return 1;
    if (code.length === 3) return 2;
    if (code.length === 5) return 3;
    return 4;
  }

  private getParent(code: string) {
    if (code.length <= 2) return null;
    if (code.length === 3) return code.slice(0, 2);
    if (code.length === 5) return code.slice(0, 3);
    return code.slice(0, 5);
  }

  // 🔥 Create (manual)
  async create(data: Partial<Disease>) {
    return this.diseaseModel.create(data);
  }

  // 🔍 Smart Search
  async search(query: string) {
    return this.diseaseModel.aggregate([
      {
        $match: { $text: { $search: query } },
      },
      {
        $addFields: {
          score: { $meta: 'textScore' },
        },
      },
      {
        $addFields: {
          levelBoost: {
            $switch: {
              branches: [
                { case: { $eq: ['$level', 4] }, then: 3 },
                { case: { $eq: ['$level', 3] }, then: 2 },
                { case: { $eq: ['$level', 2] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      {
        $addFields: {
          finalScore: { $add: ['$score', '$levelBoost'] },
        },
      },
      { $sort: { finalScore: -1 } },
      { $limit: 20 },
    ]);
  }

  // 🌳 Tree APIs
  async getChildren(code: string) {
    return this.diseaseModel.find({ parentCode: code });
  }

  async getParents(code: string) {
    const chain: (Document & Disease)[] = [];
    let current = await this.diseaseModel.findOne({ diseaseCode: code });

    while (current?.parentCode) {
      const parent = await this.diseaseModel.findOne({
        diseaseCode: current.parentCode,
      });
      if (!parent) break;

      chain.unshift(parent);
      current = parent;
    }

    return chain;
  }

  // 🔥 Import helper (used in script)
  async upsert(doc: any) {
    const familyCode = doc.diseaseCode.slice(0, 2);

    return this.diseaseModel.updateOne(
      { diseaseCode: doc.diseaseCode },
      {
        $set: {
          ...doc,
          familyCode,
          family: FAMILY_MAP[familyCode] || 'Other',
          parentCode: this.getParent(doc.diseaseCode),
          level: this.getLevel(doc.diseaseCode),
        },
      },
      { upsert: true },
    );
  }


}