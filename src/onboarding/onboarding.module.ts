import { Module } from '@nestjs/common';
import { OnboardingQuestionService } from './onboarding.service';
import { OnboardingQuestionController } from './onboarding.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OnboardingQuestion,
  OnboardingQuestionSchema,
} from './schema/onboarding-question.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OnboardingQuestion.name, schema: OnboardingQuestionSchema },
    ]),
  ],
  providers: [OnboardingQuestionService],
  controllers: [OnboardingQuestionController],
})
export class OnboardingModule {}
