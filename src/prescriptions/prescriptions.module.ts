import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsController } from './prescriptions.controller';
import { SafetyCheckService } from './safety-check.service';
import { Prescription, PrescriptionSchema } from './schema/prescription.schema';
import { InteractionsModule } from 'src/interactions/interactions.module';
import { DrugModule } from 'src/drug/drug.module';
import { PatientAllergyModule } from 'src/patient-allergy/patient-allergy.module';
import { Drug, DrugSchema } from 'src/drug/schemas/drug.schema';
import {
  PatientAllergy,
  PatientAllergySchema,
} from 'src/patient-allergy/schema/patient-allergy.schema';
import {
  DrugDrugInteraction,
  DrugDrugInteractionSchema,
} from 'src/interactions/schema/drug-drug-interaction.schema';
import {
  DrugDiseaseInteraction,
  DrugDiseaseInteractionSchema,
} from 'src/interactions/schema/drug-disease-interaction.schema';

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
    InteractionsModule, // DrugDrugService + DrugDiseaseService
    PatientAllergyModule, // PatientAllergyService.getActiveAllergyIndex()
    DrugModule, // Drug model for populating prescription items
  ],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService, SafetyCheckService],
  exports: [PrescriptionsService], // exported so PatientProfileModule can read active Rxs
})
export class PrescriptionsModule {}
