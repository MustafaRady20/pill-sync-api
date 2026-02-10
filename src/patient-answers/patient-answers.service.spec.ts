import { Test, TestingModule } from '@nestjs/testing';
import { PatientAnswersService } from './patient-answers.service';

describe('PatientAnswersService', () => {
  let service: PatientAnswersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientAnswersService],
    }).compile();

    service = module.get<PatientAnswersService>(PatientAnswersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
