import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DrugDrugService } from './drug-drug.service';
import { DrugDrugInteraction, DrugDrugInteractionSchema } from './schema/drug-drug-interaction.schema';
import { DrugDiseaseInteraction, DrugDiseaseInteractionSchema } from './schema/drug-disease-interaction.schema';
import { DrugDiseaseService } from './drug-disease-interaction.service';
import { DrugDiseaseController, DrugDrugController } from './interactions.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DrugDrugInteraction.name, schema: DrugDrugInteractionSchema },
      { name: DrugDiseaseInteraction.name, schema: DrugDiseaseInteractionSchema },
    ]),
  ],
  controllers: [
    DrugDrugController,    // /interactions/drug-drug
    DrugDiseaseController, // /interactions/drug-disease
  ],
  providers: [DrugDrugService, DrugDiseaseService],
  exports: [
    DrugDrugService,    // → SafetyCheckService.checkDrugDrugInteractions()
    DrugDiseaseService, // → SafetyCheckService.checkDrugDiseaseInteractions()
  ],
})
export class InteractionsModule {}