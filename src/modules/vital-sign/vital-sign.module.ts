import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VitalSign, VitalSignSchema } from './schema/vital-sign.schema';
import { VitalSignsController } from './vital-sign.controller';
import { VitalSignsService } from './vital-sign.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VitalSign.name, schema: VitalSignSchema },
    ]),
  ],
  controllers: [VitalSignsController],
  providers: [VitalSignsService],
  exports: [VitalSignsService],
})
export class VitalSignsModule {}
