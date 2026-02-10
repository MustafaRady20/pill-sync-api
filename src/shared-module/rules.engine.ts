import { Injectable } from '@nestjs/common';
import { PatientAction } from './event-bus.service';


@Injectable()
export class RulesEngine {
  executeRules(answer: any) {
    const actions:PatientAction[] = [];

    if (answer.actionKey === 'NON_ADHERENCE_RISK' && answer.value >= 3) {
      actions.push({
        type: 'ALERT_PATIENT',
        severity: 'HIGH',
        message: 'Patient is at high risk of non-adherence',
      });
    }


    return actions;
  }
}
