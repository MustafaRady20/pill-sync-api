import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface PatientAction {
  type: string;
  severity: string;
  message: string;
}


@Injectable()
export class EventBusService {
  constructor(private eventEmitter: EventEmitter2) {}

  emit(event: string, payload: PatientAction) {
    this.eventEmitter.emit(event, payload);
  }

  on(event: string, listener: (payload: PatientAction) => void) {
    this.eventEmitter.on(event, listener);
  }
}
