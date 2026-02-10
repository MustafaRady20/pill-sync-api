import { Test, TestingModule } from '@nestjs/testing';
import { PatientAnswersController } from './patient-answers.controller';

describe('PatientAnswersController', () => {
  let controller: PatientAnswersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientAnswersController],
    }).compile();

    controller = module.get<PatientAnswersController>(PatientAnswersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
