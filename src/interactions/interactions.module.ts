import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DrugDrugInteraction, DrugDrugInteractionSchema } from './schema/drug-drug-interaction.schema';
import { DrugDiseaseInteraction, DrugDiseaseInteractionSchema } from './schema/drug-disease-interaction.schema';
import { DrugDrugService } from './drug-drug.service';
import { DrugDiseaseService } from './drug-disease-interaction.service';
import { InteractionsController } from './interactions.controller';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DrugDrugInteraction.name, schema: DrugDrugInteractionSchema },
      { name: DrugDiseaseInteraction.name, schema: DrugDiseaseInteractionSchema },
    ]),
  ],
  controllers: [InteractionsController],
  providers: [DrugDrugService, DrugDiseaseService],
  exports: [DrugDrugService, DrugDiseaseService], // both consumed by SafetyCheckService
})
export class InteractionsModule {}