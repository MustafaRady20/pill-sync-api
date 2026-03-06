import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PatientProfileService } from './patient-profile.service';
import { PatientProfileController } from './patient-profile.controller';

import { OnboardingModule } from '../onboarding/onboarding.module';
import { PrescriptionsModule } from '../prescriptions/prescriptions.module';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { PatientAllergyModule } from 'src/patient-allergy/patient-allergy.module';
import { PatientAnswer, PatientAnswerSchema } from './schema/patient-answers.schema';
import { Prescription, PrescriptionSchema } from 'src/prescriptions/schema/prescription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: PatientAnswer.name, schema: PatientAnswerSchema },
      { name: Prescription.name, schema: PrescriptionSchema },
    ]),
    PatientAllergyModule,
    OnboardingModule,
    PrescriptionsModule,
  ],
  controllers: [PatientProfileController],
  providers: [PatientProfileService],
})
export class PatientProfileModule {}