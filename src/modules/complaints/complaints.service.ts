import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Complaint, ComplaintDocument } from './schema/complaints.schema';
import { CreateComplaintDto } from './dtos/create-complaint.dto';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectModel(Complaint.name)
    private readonly complaintModel: Model<ComplaintDocument>,
  ) {}

  async create(dto: CreateComplaintDto): Promise<ComplaintDocument> {
    const complaint = new this.complaintModel({
      ...dto,
      patientId: new Types.ObjectId(dto.patientId),
      drugId: dto.drugId ? new Types.ObjectId(dto.drugId) : null,
    });
    return complaint.save();
  }

  async findAll(): Promise<ComplaintDocument[]> {
    return this.complaintModel
      .find()
      .populate('patientId', 'name email')
      .populate('drugId', 'name')
      .exec();
  }

  async findByPatient(patientId: string): Promise<ComplaintDocument[]> {
    return this.complaintModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .populate('drugId', 'name')
      .exec();
  }

  async findOne(id: string): Promise<ComplaintDocument> {
    const complaint = await this.complaintModel
      .findById(id)
      .populate('patientId', 'name email')
      .populate('drugId', 'name')
      .exec();

    if (!complaint) throw new NotFoundException(`Complaint #${id} not found`);
    return complaint;
  }

  async update(
    id: string,
    dto: Partial<CreateComplaintDto>,
  ): Promise<ComplaintDocument> {
    const updated = await this.complaintModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated) throw new NotFoundException(`Complaint #${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.complaintModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Complaint #${id} not found`);
  }
}
