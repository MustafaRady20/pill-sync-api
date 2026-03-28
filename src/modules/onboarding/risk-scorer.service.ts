import { Injectable } from '@nestjs/common';
import { OnboardingQuestion, OnboardingQuestionCategory } from './schema/onboarding-question.schema';


@Injectable()
export class RiskScorerService {

  private readonly CATEGORY_WEIGHTS: Record<string, number> = {
    [OnboardingQuestionCategory.ALLERGIES]: 80,
    [OnboardingQuestionCategory.CHRONIC_DISEASES]: 70,
    [OnboardingQuestionCategory.CURRENT_MEDICATIONS]: 60,
    [OnboardingQuestionCategory.SURGICAL_HISTORY]: 40,
    [OnboardingQuestionCategory.FAMILY_HISTORY]: 30,
    [OnboardingQuestionCategory.LIFESTYLE]: 20,
    [OnboardingQuestionCategory.DEMOGRAPHICS]: 10,
    [OnboardingQuestionCategory.OTHER]: 5,
  };

  private readonly HIGH_RISK_KEYWORDS = [
    'anaphylaxis', 'anaphylactic',
    'heart failure', 'renal failure', 'kidney failure', 'liver failure',
    'cancer', 'diabetes', 'epilepsy', 'seizure',
    'stroke', 'hypertension', 'asthma',
    'penicillin', 'aspirin', 'warfarin',
  ];

  score(question: OnboardingQuestion, value: unknown): number {

    if (value === false || value === null || value === '' || value === 0) return 0;

    const base = this.CATEGORY_WEIGHTS[question.category] ?? 5;
    const text = this.valueToString(value).toLowerCase();

    const hasHighRisk = this.HIGH_RISK_KEYWORDS.some((kw) => text.includes(kw));
    const score = hasHighRisk ? Math.min(base * 1.5, 100) : base;

    return Math.round(score);
  }

  private valueToString(value: unknown): string {
    if (Array.isArray(value)) return value.join(' ');
    return String(value);
  }
}