import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { AllergyExtractorService } from './allergy-extractor.service';
import { RiskScorerService } from './risk-scorer.service';

import { OnboardingQuestion, OnboardingQuestionSchema } from './schema/onboarding-question.schema';
import { PatientAnswer, PatientAnswerSchema } from 'src/patient-profile/schema/patient-answers.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { DrugModule } from 'src/drug/drug.module';
import { PatientAllergyModule } from 'src/patient-allergy/patient-allergy.module';
import { PatientAllergy, PatientAllergySchema } from 'src/patient-allergy/schema/patient-allergy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OnboardingQuestion.name, schema: OnboardingQuestionSchema },
      { name: PatientAnswer.name, schema: PatientAnswerSchema },
      { name: User.name, schema: UserSchema },
    ]),
    PatientAllergyModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService, AllergyExtractorService, RiskScorerService],
  exports: [OnboardingService],
})
export class OnboardingModule {}