import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.auth.guard';
import type { UserDocument } from 'src/modules/users/schemas/user.schema';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';

@ApiTags('Onboarding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('onboarding')
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Get('questions')
  @ApiOperation({ summary: 'Get all active onboarding questions in order' })
  getQuestions() {
    return this.onboardingService.getActiveQuestions();
  }

  // @Post('submit')
  // @ApiOperation({ summary: 'Patient submits their onboarding answers' })
  // submitAnswers(@CurrentUser() user: UserDocument, @Body() dto: SubmitAnswersDto) {
  //   return this.onboardingService.submitAnswers(user._id.toString(), dto);
  // }

  @Get('my-answers')
  @ApiOperation({ summary: 'Get current patient onboarding answers' })
  getMyAnswers(@CurrentUser() user: UserDocument) {
    return this.onboardingService.getPatientAnswers(user._id.toString());
  }
}