import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsController } from './prescriptions.controller';
import { SafetyCheckService } from './safety-check.service';
import { Prescription, PrescriptionSchema } from './schema/prescription.schema';
import { InteractionsModule } from 'src/modules/interactions/interactions.module';
import { DrugModule } from 'src/modules/drug/drug.module';
import { PatientAllergyModule } from 'src/modules/patient-allergy/patient-allergy.module';
import { Drug, DrugSchema } from 'src/modules/drug/schemas/drug.schema';
import {
  PatientAllergy,
  PatientAllergySchema,
} from 'src/modules/patient-allergy/schema/patient-allergy.schema';
import {
  DrugDrugInteraction,
  DrugDrugInteractionSchema,
} from 'src/modules/interactions/schema/drug-drug-interaction.schema';
import {
  DrugDiseaseInteraction,
  DrugDiseaseInteractionSchema,
} from 'src/modules/interactions/schema/drug-disease-interaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prescription.name, schema: PrescriptionSchema },
      { name: Drug.name, schema: DrugSchema },
      { name: PatientAllergy.name, schema: PatientAllergySchema },
      { name: DrugDrugInteraction.name, schema: DrugDrugInteractionSchema },
      {
        name: DrugDiseaseInteraction.name,
        schema: DrugDiseaseInteractionSchema,
      },
    ]),
    InteractionsModule, 
    PatientAllergyModule, 
    DrugModule, 
  ],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService, SafetyCheckService],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
