import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventBusService } from './event-bus.service';
import { NormalizationService } from './normalization.service';
import { RulesEngine } from './rules.engine';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [EventBusService, NormalizationService, RulesEngine],
  exports: [EventBusService, NormalizationService, RulesEngine],
})
export class SharedModule {}
