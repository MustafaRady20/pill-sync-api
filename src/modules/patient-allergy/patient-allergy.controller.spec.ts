import { Test, TestingModule } from '@nestjs/testing';
import { PatientAllergyController } from './patient-allergy.controller';

describe('PatientAllergyController', () => {
  let controller: PatientAllergyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientAllergyController],
    }).compile();

    controller = module.get<PatientAllergyController>(PatientAllergyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
