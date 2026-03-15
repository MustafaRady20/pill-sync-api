import { Test, TestingModule } from '@nestjs/testing';
import { PatientAllergyService } from './patient-allergy.service';

describe('PatientAllergyService', () => {
  let service: PatientAllergyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientAllergyService],
    }).compile();

    service = module.get<PatientAllergyService>(PatientAllergyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
