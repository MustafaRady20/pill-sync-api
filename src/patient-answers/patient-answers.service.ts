import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PatientAnswer, PatientAnswerDocument } from './schema/patient-answers.schema';

@Injectable()
export class PatientAnswersService {
  constructor(
    @InjectModel(PatientAnswer.name) 
    private readonly answerModel: Model<PatientAnswerDocument>
  ) {}

  async submitAnswer(patientId: string, questionKey: string, value: any) {
    const normalizedValue = typeof value === 'number' ? (value >= 3 ? 'HIGH' : 'LOW') : value;
    const riskScore = typeof value === 'number' ? value * 20 : 0;

    return this.answerModel.create({
      patientId,
      questionKey,
      value,
      normalizedValue,
      riskScore,
    });
  }

  async getAnswers(patientId: string) {
    return this.answerModel.find({ patientId });
  }
}
