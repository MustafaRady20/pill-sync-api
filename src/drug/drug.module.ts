import { Module } from '@nestjs/common';
import { DrugController } from './drug.controller';
import { DrugService } from './drug.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Drug, DrugSchema } from './schemas/drug.schema';

const DrugMongooseModule = MongooseModule.forFeature([
  { name: Drug.name, schema: DrugSchema },
]);

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Drug.name, schema: DrugSchema }]),
  ],
  providers: [DrugService],
  controllers: [DrugController],
  exports: [DrugService,DrugMongooseModule],
})
export class DrugModule {}
