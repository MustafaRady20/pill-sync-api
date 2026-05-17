import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Disease, DiseaseSchema } from './schema/disease.schema';
import { DiseaseService } from './diseases.service';
import { DiseaseController } from './diseases.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Disease.name, schema: DiseaseSchema }]),
  ],
  controllers: [DiseaseController],
  providers: [DiseaseService],
  exports: [DiseaseService],
})
export class DiseaseModule {}
