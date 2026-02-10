import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { PatientAnswersService } from './patient-answers.service';

@Controller('patients/:patientId/answers')
export class PatientAnswersController {
  constructor(private readonly service: PatientAnswersService) {}

  @Post()
  submitAnswer(
    @Param('patientId') patientId: string,
    @Body() body: { questionKey: string; value: any }
  ) {
    return this.service.submitAnswer(patientId, body.questionKey, body.value);
  }

  @Get()
  getAnswers(@Param('patientId') patientId: string) {
    return this.service.getAnswers(patientId);
  }
}
