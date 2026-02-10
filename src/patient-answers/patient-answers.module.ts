import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingModule } from 'src/onboarding/onboarding.module';
import {
  PatientAnswer,
  PatientAnswerSchema,
} from './schema/patient-answers.schema';
import { PatientAnswersController } from './patient-answers.controller';
import { PatientAnswersService } from './patient-answers.service';
import { SharedModule } from 'src/shared-module/shared-module.module';

@Module({
  imports: [
    SharedModule,
    OnboardingModule,
    MongooseModule.forFeature([
      { name: PatientAnswer.name, schema: PatientAnswerSchema },
    ]),
  ],
  controllers: [PatientAnswersController],
  providers: [PatientAnswersService],
  exports: [PatientAnswersService],
})
export class PatientAnswersModule {}
