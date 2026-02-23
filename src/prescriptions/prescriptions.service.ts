import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Prescription, PrescriptionDocument, PrescriptionStatus } from './schema/prescription.schema';
import { SafetyCheckService } from './safety-check.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { SafetyOverrideDto } from './dto/safety-override.dto';


@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectModel(Prescription.name)
    private prescriptionModel: Model<PrescriptionDocument>,
    private safetyCheckService: SafetyCheckService,
  ) {}

  // ─── Doctor: create draft ────────────────────────────────────────────────

  async create(doctorId: string, dto: CreatePrescriptionDto): Promise<PrescriptionDocument> {
    return this.prescriptionModel.create({
      patientId: new Types.ObjectId(dto.patientId),
      doctorId: new Types.ObjectId(doctorId),
      items: dto.items.map((item) => ({
        ...item,
        drug: new Types.ObjectId(item.drugId),
      })),
      status: PrescriptionStatus.DRAFT,
      notes: dto.notes,
    });
  }

  // ─── Doctor: run safety check then activate ──────────────────────────────

  /**
   * Flow:
   *   1. Load prescription (must be DRAFT and belong to this doctor)
   *   2. Collect all drug IDs — from THIS prescription PLUS patient's other ACTIVE prescriptions
   *   3. Run SafetyCheckService.runFullCheck()
   *   4a. If passed → set status = ACTIVE, store result
   *   4b. If failed → store result, throw 422 with warnings (doctor must explicitly override)
   */
  async activate(
    doctorId: string,
    prescriptionId: string,
  ): Promise<PrescriptionDocument> {
    const prescription = await this.findOneOrFail(prescriptionId);
    this.assertDoctor(prescription, doctorId);

    if (prescription.status !== PrescriptionStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT prescriptions can be activated');
    }

    // Gather drug IDs from THIS prescription
    const newDrugIds = prescription.items.map((i) => i.drug.toString());

    // Also include drugs from other ACTIVE prescriptions of the same patient
    const otherActivePrescriptions = await this.prescriptionModel.find({
      patientId: prescription.patientId,
      status: PrescriptionStatus.ACTIVE,
      _id: { $ne: prescription._id },
    });
    const existingDrugIds = otherActivePrescriptions.flatMap((p) =>
      p.items.map((i) => i.drug.toString()),
    );

    const allDrugIds = [...new Set([...newDrugIds, ...existingDrugIds])];

    // Run the full safety check
    const safetyResult = await this.safetyCheckService.runFullCheck(
      prescription.patientId.toString(),
      allDrugIds,
    );

    prescription.safetyCheckResult = safetyResult;

    if (safetyResult.passed) {
      prescription.status = PrescriptionStatus.ACTIVE;
      prescription.prescribedAt = new Date();
    }

    await prescription.save();

    if (!safetyResult.passed) {
      // Return a 422 so the frontend can display warnings and prompt the doctor to override
      throw new BadRequestException({
        message: 'Safety check failed — review warnings before activating',
        safetyCheckResult: safetyResult,
      });
    }

    return prescription;
  }

  // ─── Doctor: override safety warnings and force-activate ─────────────────

  async overrideAndActivate(
    doctorId: string,
    prescriptionId: string,
    dto: SafetyOverrideDto,
  ): Promise<PrescriptionDocument> {
    const prescription = await this.findOneOrFail(prescriptionId);
    this.assertDoctor(prescription, doctorId);

    if (!prescription.safetyCheckResult) {
      throw new BadRequestException('Run safety check first before overriding');
    }

    prescription.status = PrescriptionStatus.ACTIVE;
    prescription.prescribedAt = new Date();
    prescription.safetyOverride = true;
    prescription.safetyOverrideReason = dto.reason;

    return prescription.save();
  }

  // ─── Doctor: cancel ───────────────────────────────────────────────────────

  async cancel(doctorId: string, prescriptionId: string): Promise<PrescriptionDocument> {
    const prescription = await this.findOneOrFail(prescriptionId);
    this.assertDoctor(prescription, doctorId);

    if (prescription.status === PrescriptionStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed prescription');
    }

    prescription.status = PrescriptionStatus.CANCELLED;
    return prescription.save();
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  async getPatientPrescriptions(patientId: string): Promise<PrescriptionDocument[]> {
    return this.prescriptionModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .populate('items.drug')
      .sort({ createdAt: -1 })
      .lean();
  }

  async getDoctorPrescriptions(doctorId: string): Promise<PrescriptionDocument[]> {
    return this.prescriptionModel
      .find({ doctorId: new Types.ObjectId(doctorId) })
      .populate('items.drug patientId')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findOne(prescriptionId: string): Promise<PrescriptionDocument> {
    return this.findOneOrFail(prescriptionId);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async findOneOrFail(id: string): Promise<PrescriptionDocument> {
    const doc = await this.prescriptionModel.findById(id).populate('items.drug');
    if (!doc) throw new NotFoundException('Prescription not found');
    return doc;
  }

  private assertDoctor(prescription: PrescriptionDocument, doctorId: string): void {
    if (prescription.doctorId.toString() !== doctorId) {
      throw new ForbiddenException('You are not the prescribing doctor');
    }
  }
}