import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Appointment, AppointmentDocument } from "./schemas/appointments.schema";
import { CreateAppointmentDto } from "./dtos/create-appointment.dto";

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>
  ) {}

  async create(dto: CreateAppointmentDto): Promise<AppointmentDocument> {
    const appointment = new this.appointmentModel({
      ...dto,
      patientId: new Types.ObjectId(dto.patientId),
    });
    return appointment.save();
  }

  async findAll(): Promise<AppointmentDocument[]> {
    return this.appointmentModel
      .find()
      .populate("patientId", "name email")
      .exec();
  }

  async findByPatient(patientId: string): Promise<AppointmentDocument[]> {
    return this.appointmentModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .exec();
  }

  async findOne(id: string): Promise<AppointmentDocument> {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate("patientId", "name email")
      .exec();

    if (!appointment) throw new NotFoundException(`Appointment #${id} not found`);
    return appointment;
  }

  async update(id: string, dto: Partial<CreateAppointmentDto>): Promise<AppointmentDocument> {
    const updated = await this.appointmentModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated) throw new NotFoundException(`Appointment #${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.appointmentModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Appointment #${id} not found`);
  }
}