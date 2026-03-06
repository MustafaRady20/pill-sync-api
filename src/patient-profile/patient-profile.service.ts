import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { PatientAnswer, PatientAnswerDocument } from './schema/patient-answers.schema';
import { Prescription, PrescriptionDocument, PrescriptionStatus } from 'src/prescriptions/schema/prescription.schema';
import { AllergySeverity, PatientAllergy, PatientAllergyDocument } from '../patient-allergy/schema/patient-allergy.schema';

@Injectable()
export class PatientProfileService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(PatientAllergy.name) private allergyModel: Model<PatientAllergyDocument>,
    @InjectModel(PatientAnswer.name) private answerModel: Model<PatientAnswerDocument>,
    @InjectModel(Prescription.name) private prescriptionModel: Model<PrescriptionDocument>,
  ) {}

  /**
   * Full patient summary for the doctor's view:
   *   - demographics
   *   - active allergies
   *   - onboarding answers (medical history)
   *   - active prescriptions (to spot cross-prescription interactions)
   *   - overall risk score
   */
  async getFullProfile(patientId: string) {
    const patient = await this.userModel.findById(patientId).lean();
    if (!patient) throw new NotFoundException('Patient not found');

    const [allergies, answers, activePrescriptions] = await Promise.all([
      this.allergyModel.find({ patientId: new Types.ObjectId(patientId), isActive: true }).lean(),
      this.answerModel.find({ patientId: new Types.ObjectId(patientId) }).lean(),
      this.prescriptionModel
        .find({ patientId: new Types.ObjectId(patientId), status: PrescriptionStatus.ACTIVE })
        .populate('items.drug')
        .lean(),
    ]);

    const overallRiskScore = this.computeOverallRisk(answers.map((a) => a.riskScore));

    return {
      patient: {
        id: patient._id,
        email: patient.email,
        firstName: patient.firstName,
        lastName: patient.lastName,
        hasCompletedOnboarding: patient.hasCompletedOnboarding,
      },
      overallRiskScore,
      riskLevel: this.riskLevel(overallRiskScore),
      allergies,
      medicalHistory: answers,
      activePrescriptions,
    };
  }

  // ─── Allergy management (doctor can add/update/deactivate) ───────────────

  async addAllergy(
    patientId: string,
    data: {
      name: string;
      severity?: AllergySeverity;
      reaction?: string;
    },
  ): Promise<PatientAllergyDocument> {
    return this.allergyModel.findOneAndUpdate(
      { patientId: new Types.ObjectId(patientId), name: data.name.toLowerCase().trim() },
      {
        $set: {
          severity: data.severity ?? AllergySeverity.UNKNOWN,
          reaction: data.reaction,
          confirmedByDoctor: true,
          isActive: true,
        },
      },
      { upsert: true, new: true },
    );
  }

  async deactivateAllergy(patientId: string, allergyId: string): Promise<PatientAllergyDocument> {
    const allergy = await this.allergyModel.findOneAndUpdate(
      { _id: new Types.ObjectId(allergyId), patientId: new Types.ObjectId(patientId) },
      { $set: { isActive: false } },
      { new: true },
    );
    if (!allergy) throw new NotFoundException('Allergy record not found');
    return allergy;
  }

  async getPatientAllergies(patientId: string): Promise<PatientAllergyDocument[]> {
    return this.allergyModel
      .find({ patientId: new Types.ObjectId(patientId), isActive: true })
      .lean();
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private computeOverallRisk(scores: number[]): number {
    if (!scores.length) return 0;
    // Weighted average — top 3 scores count double to surface worst risks
    const sorted = [...scores].sort((a, b) => b - a);
    const top3 = sorted.slice(0, 3);
    const rest = sorted.slice(3);
    const weighted = [...top3.map((s) => s * 2), ...rest];
    return Math.round(weighted.reduce((a, b) => a + b, 0) / weighted.length);
  }

  private riskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 35) return 'medium';
    return 'low';
  }
}