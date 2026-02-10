import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { CreateOnboardingQuestionDto } from './dto/create-onboarding-question.dto';
import { UpdateOnboardingQuestionDto } from './dto/update-onboarding-question.dto';
import { OnboardingQuestionService } from './onboarding.service';

@Controller('onboarding-questions')
export class OnboardingQuestionController {
  constructor(private readonly service: OnboardingQuestionService) {}

  @Post()
  create(@Body() dto: CreateOnboardingQuestionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('activeOnly') activeOnly: string) {
    return this.service.findAll(activeOnly !== 'false');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOnboardingQuestionDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Patch(':id/order')
  reorder(
    @Param('id') id: string,
    @Body('order') order: number,
  ) {
    return this.service.reorder(id, order);
  }
}
