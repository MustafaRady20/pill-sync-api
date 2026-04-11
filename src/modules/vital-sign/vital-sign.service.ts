import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateVitalSignDto } from "./dto/create-vital-sign.dto";
import { VitalSign, VitalSignDocument } from "./schema/vital-sign.schema";

@Injectable()
export class VitalSignsService {
  constructor(
    @InjectModel(VitalSign.name)
    private readonly vitalSignModel: Model<VitalSignDocument>
  ) {}

  async create(dto: CreateVitalSignDto): Promise<VitalSignDocument> {
    const doc = new this.vitalSignModel({
      ...dto,
      patientId : new Types.ObjectId(dto.patientId),
      diseaseId : dto.diseaseId ? new Types.ObjectId(dto.diseaseId) : null,
      drugId    : dto.drugId    ? new Types.ObjectId(dto.drugId)    : null,
    });
    return doc.save();
  }

  async findAll(): Promise<VitalSignDocument[]> {
    return this.vitalSignModel
      .find()
      .populate("patientId", "name email")
      .populate("diseaseId", "name")
      .populate("drugId", "name")
      .exec();
  }

  async findByPatient(patientId: string): Promise<VitalSignDocument[]> {
    return this.vitalSignModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .populate("diseaseId", "name")
      .populate("drugId", "name")
      .exec();
  }

  async findByPatientAndType(patientId: string, type: string): Promise<VitalSignDocument[]> {
    return this.vitalSignModel
      .find({ patientId: new Types.ObjectId(patientId), type })
      .sort({ measuredAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<VitalSignDocument> {
    const doc = await this.vitalSignModel
      .findById(id)
      .populate("patientId", "name email")
      .populate("diseaseId", "name")
      .populate("drugId", "name")
      .exec();

    if (!doc) throw new NotFoundException(`VitalSign #${id} not found`);
    return doc;
  }

  async update(id: string, dto: Partial<CreateVitalSignDto>): Promise<VitalSignDocument> {
    const updated = await this.vitalSignModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated) throw new NotFoundException(`VitalSign #${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.vitalSignModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`VitalSign #${id} not found`);
  }
}