import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OnboardingQuestion, OnboardingQuestionCategory, OnboardingQuestionDocument } from './schema/onboarding-question.schema';
import { PatientAnswer, PatientAnswerDocument } from 'src/modules/patient-profile/schema/patient-answers.schema';
import { User, UserDocument } from 'src/modules/users/schemas/user.schema';
import { RiskScorerService } from './risk-scorer.service';
import { AllergyExtractorService } from './allergy-extractor.service';
import { SubmitAnswersDto } from './dto/submit-answers.dto';




@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(OnboardingQuestion.name)
    private questionModel: Model<OnboardingQuestionDocument>,
    @InjectModel(PatientAnswer.name)
    private answerModel: Model<PatientAnswerDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private allergyExtractor: AllergyExtractorService,
    private riskScorer: RiskScorerService,
  ) {}

  // ─── Questions ────────────────────────────────────────────────────────────

  async getActiveQuestions(): Promise<OnboardingQuestionDocument[]> {
    return this.questionModel
      .find({ isActive: true })
      .sort({ order: 1 })
      .lean();
  }

  async createQuestion(data: Partial<OnboardingQuestion>): Promise<OnboardingQuestionDocument> {
    return this.questionModel.create(data);
  }


  async submitAnswers(patientId: string, dto: SubmitAnswersDto): Promise<{ message: string }> {
    const questions = await this.questionModel.find({ isActive: true }).lean();
    const questionMap = new Map(questions.map((q) => [q.key, q]));

    const requiredKeys = questions.filter((q) => q.isRequired).map((q) => q.key);
    const answeredKeys = new Set(dto.answers.map((a) => a.questionKey));
    const missing = requiredKeys.filter((k) => !answeredKeys.has(k));
    if (missing.length) {
      throw new BadRequestException(`Missing required answers: ${missing.join(', ')}`);
    }

    // 2. Upsert answers
    const upsertOps = dto.answers.map((answer) => {
      const question = questionMap.get(answer.questionKey);
      if (!question) throw new BadRequestException(`Unknown question key: ${answer.questionKey}`);

      const riskScore = this.riskScorer.score(question, answer.value);

      return {
        updateOne: {
          filter: { patientId: new Types.ObjectId(patientId), questionKey: answer.questionKey },
          update: {
            $set: {
              value: answer.value,
              normalizedValue: this.normalize(answer.value),
              riskScore,
            },
          },
          upsert: true,
        },
      };
    });

    await this.answerModel.bulkWrite(upsertOps);


    const allergyAnswers = dto.answers.filter((a) => {
      const q = questionMap.get(a.questionKey);
      return q?.category === OnboardingQuestionCategory.ALLERGIES;
    });
    if (allergyAnswers.length) {

      const rawAllergyAnswers: any[] = allergyAnswers
        .map((a) => {
          if (Array.isArray(a.value)) {
            const vals = a.value.map((v) => String(v).trim()).filter((s) => s.length);
            return vals.length ? { ...a, value: vals } : undefined;
          } else if (a.value !== undefined && a.value !== null) {
            const s = String(a.value).trim();
            return s.length ? { ...a, value: s } : undefined;
          }
          return undefined;
        })
        .filter(Boolean) as any[];

      if (rawAllergyAnswers.length) {
        await this.allergyExtractor.extractAndSave(patientId, rawAllergyAnswers);
      }
    }

    // 5. Mark onboarding complete
    await this.userModel.findByIdAndUpdate(patientId, { hasCompletedOnboarding: true });

    return { message: 'Onboarding completed successfully' };
  }

  async getPatientAnswers(patientId: string): Promise<PatientAnswerDocument[]> {
    return this.answerModel.find({ patientId: new Types.ObjectId(patientId) }).lean();
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private normalize(value: unknown): string | string[] | undefined {
    if (typeof value === 'string') return value.toLowerCase().trim();
    if (Array.isArray(value)) return value.map((v) => String(v).toLowerCase().trim());
    return undefined;
  }
}