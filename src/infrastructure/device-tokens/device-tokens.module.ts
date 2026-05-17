import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceTokensService } from './device-tokens.service';
import { DeviceTokensController } from './device-tokens.controller';
import { DeviceToken, DeviceTokenSchema } from './schema/device-token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceToken.name, schema: DeviceTokenSchema },
    ]),
  ],
  providers: [DeviceTokensService],
  controllers: [DeviceTokensController],
  exports: [DeviceTokensService],
})
export class DeviceTokensModule {}
