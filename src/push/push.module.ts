import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { DeviceTokensModule } from '../device-tokens/device-tokens.module';

@Module({
  imports: [DeviceTokensModule],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}