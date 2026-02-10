import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OnboardingQuestion } from './schemas/onboarding-question.schema';
import { CreateOnboardingQuestionDto } from './dto/create-onboarding-question.dto';
import { UpdateOnboardingQuestionDto } from './dto/update-onboarding-question.dto';

@Injectable()
export class OnboardingQuestionService {
  constructor(
    @InjectModel(OnboardingQuestion.name)
    private readonly questionModel: Model<OnboardingQuestion>,
  ) {}

  async create(dto: CreateOnboardingQuestionDto) {
    return this.questionModel.create(dto);
  }

  async findAll(activeOnly = true) {
    const filter = activeOnly ? { isActive: true } : {};
    return this.questionModel.find(filter).sort({ order: 1 });
  }

  async findOne(id: string) {
    const question = await this.questionModel.findById(id);
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async update(id: string, dto: UpdateOnboardingQuestionDto) {
    const updated = await this.questionModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    );
    if (!updated) throw new NotFoundException('Question not found');
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.questionModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Question not found');
    return { success: true };
  }

  async reorder(id: string, order: number) {
    return this.questionModel.findByIdAndUpdate(
      id,
      { order },
      { new: true },
    );
  }
}
