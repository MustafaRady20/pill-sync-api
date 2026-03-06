import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PatientAllergyService } from './patient-allergy.service';
import { MyAllergyController, DoctorAllergyController } from './patient-allergy.controller';
import { PatientAllergy, PatientAllergySchema } from './schema/patient-allergy.schema';
import { DrugModule } from 'src/drug/drug.module';
import { Drug, DrugSchema } from 'src/drug/schemas/drug.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PatientAllergy.name, schema: PatientAllergySchema },
      { name: Drug.name, schema: DrugSchema },
    ]),
  ],
  controllers: [
    MyAllergyController,
    DoctorAllergyController,
  ],
  providers: [PatientAllergyService],
  exports: [
    PatientAllergyService,
    MongooseModule,   // important so other modules can access the model
  ],
})
export class PatientAllergyModule {}
