import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { AllergyExtractorService } from './allergy-extractor.service';
import { RiskScorerService } from './risk-scorer.service';

import { OnboardingQuestion, OnboardingQuestionSchema } from './schema/onboarding-question.schema';
import { PatientAnswer, PatientAnswerSchema } from 'src/modules/patient-profile/schema/patient-answers.schema';
import { User, UserSchema } from 'src/modules/users/schemas/user.schema';
import { DrugModule } from 'src/modules/drug/drug.module';
import { PatientAllergyModule } from 'src/modules/patient-allergy/patient-allergy.module';
import { PatientAllergy, PatientAllergySchema } from 'src/modules/patient-allergy/schema/patient-allergy.schema';

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