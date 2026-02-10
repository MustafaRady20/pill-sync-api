import { Injectable } from '@nestjs/common';

@Injectable()
export class NormalizationService {
  normalizeAnswer(value: any, type: string): string {
    switch (type) {
      case 'number':
        return value >= 3 ? 'HIGH' : 'LOW';
      case 'boolean':
        return value ? 'YES' : 'NO';
      case 'single_choice':
      case 'multiple_choice':
        return Array.isArray(value) ? value.join(',') : value;
      default:
        return String(value);
    }
  }

  calculateRiskScore(value: any, type: string): number {
    if (type === 'number') return value * 20;
    if (type === 'boolean') return value ? 100 : 0;
    return 0;
  }
}
