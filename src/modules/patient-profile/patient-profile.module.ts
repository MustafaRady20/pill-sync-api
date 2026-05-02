import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';


import { OnboardingModule } from '../onboarding/onboarding.module';
import { PrescriptionsModule } from '../prescriptions/prescriptions.module';
import { User, UserSchema } from 'src/modules/users/schemas/user.schema';
import { PatientAnswer, PatientAnswerSchema } from './schema/patient-answers.schema';
import { Prescription, PrescriptionSchema } from 'src/modules/prescriptions/schema/prescription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: PatientAnswer.name, schema: PatientAnswerSchema },
      { name: Prescription.name, schema: PrescriptionSchema },
    ]),
   
    OnboardingModule,
    PrescriptionsModule,
  ],
  controllers: [],
  providers: [],
})
export class PatientProfileModule {}