import {
  Controller,
  Get,
  UseGuards,
  Post,
  HttpCode,
  Body,
  HttpStatus,
  Patch,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  AllergiesDto,
  MedicalConditionDto,
  MedicalHistoryDto,
  PersonalInfoDto,
} from './dto/onboarding.dto';
import type { UserDocument } from './schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';

@ApiTags('User Profile')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post('personal-info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Step 1 — Save personal info (name, DOB, gender, weight, height…)',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile created / updated at step 1',
  })
  savePersonalInfo(
    @CurrentUser() user: UserDocument,
    @Body() dto: PersonalInfoDto,
  ) {
    return this.userService.savePersonalInfo(user._id.toString(), dto);
  }

  @Post('allergies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Step 2 — Save drug & food allergies' })
  saveAllergies(@CurrentUser() user: UserDocument, @Body() dto: AllergiesDto) {
    return this.userService.saveAllergies(user._id.toString(), dto);
  }

  @Post('medical-history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Step 3 — Save medical conditions (completes onboarding)',
  })
  saveMedicalHistory(
    @CurrentUser() user: UserDocument,
    @Body() dto: MedicalHistoryDto,
  ) {
    return this.userService.saveMedicalHistory(user._id.toString(), dto);
  }

  // ─── Fetch profile ────────────────────────────────────────────────────────

  @Get('profile')
  @ApiOperation({ summary: 'Get current onboarding profile & progress' })
  getProfile(@CurrentUser() user: UserDocument) {
    return this.userService.getProfile(user._id.toString());
  }

  // ─── Patch a single condition (post-onboarding follow-up answers) ─────────

  @Patch('conditions/:index')
  @ApiOperation({
    summary: 'Update a specific condition by index (follow-up Q&A)',
  })
  updateCondition(
    @CurrentUser() user: UserDocument,
    @Param('index') index: number,
    @Body() dto: Partial<MedicalConditionDto>,
  ) {
    return this.userService.updateCondition(user._id.toString(), index, dto);
  }
}
